import { LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../config/database.config";
import { Meeting, MeetingStatus } from "../database/entities/meeting.entity";
import {
  MeetingFilterEnum,
  MeetingFilterEnumType,
} from "../enums/meeting.enum";
import { CreateMeetingDto } from "../database/dto/meeting.dto";
import {
  Event,
  EventLocationEnumType,
} from "../database/entities/event.entity";
import {
  Integration,
  IntegrationAppTypeEnum,
  IntegrationCategoryEnum,
} from "../database/entities/integration.entity";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { validateGoogleToken } from "./integration.service";
import { googleOAuth2Client } from "../config/oauth.config";
import { google } from "googleapis";

export const getUserMeetingsService = async (
  userId: string,
  filter: MeetingFilterEnumType
) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const where: any = { user: { id: userId } };

  if (filter === MeetingFilterEnum.UPCOMING) {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = MoreThan(new Date());
  } else if (filter === MeetingFilterEnum.PAST) {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = LessThan(new Date());
  } else if (filter === MeetingFilterEnum.CANCELLED) {
    where.status = MeetingStatus.CANCELLED;
  } else {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = MoreThan(new Date());
  }

  const meetings = await meetingRepository.find({
    where,
    relations: ["event"],
    order: { startTime: "ASC" },
  });

  return meetings || [];
};

export const createMeetBookingForGuestService = async (
  createMeetingDto: CreateMeetingDto
) => {
  const { eventId, guestEmail, guestName, additionalInfo } = createMeetingDto;
  const startTime = new Date(createMeetingDto.startTime);
  const endTime = new Date(createMeetingDto.endTime);

  const eventRepository = AppDataSource.getRepository(Event);
  const integrationRepository = AppDataSource.getRepository(Integration);
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: ["user"],
  });

  if (!event) throw new NotFoundException("Event not found");

  if (!Object.values(EventLocationEnumType).includes(event.locationType)) {
    throw new BadRequestException("Invalid location type");
  }

  const meetIntegration = await integrationRepository.findOne({
    where: {
      user: { id: event.user.id },
      app_type: IntegrationAppTypeEnum[event.locationType],
    },
  });

  if (!meetIntegration)
    throw new BadRequestException("No video conferencing integration found");

  let meetLink: string = "";
  let calendarEventId: string = "";
  let calendarAppType: string = "";

  if (event.locationType === EventLocationEnumType.GOOGLE_MEET_AND_CALENDAR) {
    const { calendarType, calendar } = await getCalendarClient(
      meetIntegration.app_type,
      meetIntegration.access_token,
      meetIntegration.refresh_token,
      meetIntegration.expiry_date
    );
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${guestName} - ${event.title}`,
        description: additionalInfo,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [{ email: guestEmail }, { email: event.user.email }],
        conferenceData: {
          createRequest: {
            requestId: `${event.id}-${Date.now()}`,
          },
        },
      },
    });

    meetLink = response.data.hangoutLink!;
    calendarEventId = response.data.id!;
    calendarAppType = calendarType;
  }

  const meeting = meetingRepository.create({
    event: { id: event.id },
    user: event.user,
    guestName,
    guestEmail,
    additionalInfo,
    startTime,
    endTime,
    meetLink: meetLink,
    calendarEventId: calendarEventId,
    calendarAppType: calendarAppType,
  });

  await meetingRepository.save(meeting);

  return {
    meetLink,
    meeting,
  };
};

export const cancelMeetingService = async (meetingId: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const integrationRepository = AppDataSource.getRepository(Integration);

  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["event", "event.user"],
  });
  if (!meeting) throw new NotFoundException("Meeting not found");

  try {
    const calendarIntegration = await integrationRepository.findOne({
      where: {
        app_type:
          IntegrationAppTypeEnum[
            meeting.calendarAppType as keyof typeof IntegrationAppTypeEnum
          ],
      },
    });

    // const calendarIntegration = await integrationRepository.findOne({
    //   where: [
    //     {
    //       user: { id: meeting.event.user.id },
    //       category: IntegrationCategoryEnum.CALENDAR_AND_VIDEO_CONFERENCING,
    //     },
    //     {
    //       user: { id: meeting.event.user.id },
    //       category: IntegrationCategoryEnum.CALENDAR,
    //     },
    //   ],
    // });

    if (calendarIntegration) {
      const { calendar, calendarType } = await getCalendarClient(
        calendarIntegration.app_type,
        calendarIntegration.access_token,
        calendarIntegration.refresh_token,
        calendarIntegration.expiry_date
      );
      switch (calendarType) {
        case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
          await calendar.events.delete({
            calendarId: "primary",
            eventId: meeting.calendarEventId,
          });
          break;
        default:
          throw new BadRequestException(
            `Unsupported calendar provider: ${calendarType}`
          );
      }
    }
  } catch (error) {
    throw new BadRequestException("Failed to delete event from calendar");
  }

  meeting.status = MeetingStatus.CANCELLED;
  await meetingRepository.save(meeting);
  return { success: true };
};

async function getCalendarClient(
  appType: IntegrationAppTypeEnum,
  access_token: string,
  refresh_token: string,
  expiry_date: number | null
) {
  switch (appType) {
    case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
      const validToken = await validateGoogleToken(
        access_token,
        refresh_token,
        expiry_date
      );
      googleOAuth2Client.setCredentials({ access_token: validToken });
      const calendar = google.calendar({
        version: "v3",
        auth: googleOAuth2Client,
      });
      return {
        calendar,
        calendarType: IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
      };
    default:
      throw new BadRequestException(
        `Unsupported Calendar provider: ${appType}`
      );
  }
}
