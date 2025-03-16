import { Fragment, useRef, useState } from "react";
import { ChevronDown, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingType, PeriodType } from "@/types/api.type";
import { format, parseISO } from "date-fns";
import { locationOptions } from "@/lib/types";
import { PeriodEnum } from "@/hooks/use-meeting-filter";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";

const MeetingCard = (props: {
  meeting: MeetingType;
  period: PeriodType;
  isPending: boolean;
  onCancel: () => void;
}) => {
  const { meeting, isPending, period, onCancel } = props;

  const [isShow, setIsShow] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Format the date and time
  const startTime = parseISO(meeting.startTime);
  const endTime = parseISO(meeting.endTime);
  const formattedDate = format(startTime, "EEEE, d MMMM yyyy"); // e.g., "Wednesday, 19 March 2025"
  const formattedTime = `${format(startTime, "h:mm a")} – ${format(
    endTime,
    "h:mm a"
  )}`;

  const locationOption = locationOptions.find(
    (option) => option.value === meeting.event.locationType
  );

  const toggleDetails = () => {
    setIsShow(!isShow);
  };
  return (
    <div className="w-full">
      <h2
        className="day-header p-[16px_24px] border-y
      border-[#D4E16F] bg-[#fafafa] text-base font-bold tracking-wide"
      >
        {formattedDate}
      </h2>

      {/* {Event body} */}
      {/* {Event body} */}
      <div role="buton" className="event-list-body" onClick={toggleDetails}>
        <div
          className="flex flex-row bg-white relative w-full p-6 text-left 
        cursor-pointer transition-colors duration-200 ease-in-out"
        >
          <div
            className="flex-shrink-0 box-border pr-4 pl-10 inline-block
          mb-[5px]"
          >
            <span className="event-time">{formattedTime}</span>
            <span
              className={cn(
                `absolute bg-primary/70
              top-[20px] left-[23px] inline-block box-border w-[30px]
             h-[30px] rounded-full`,
                period === PeriodEnum.CANCELLED && "!bg-destructive/70"
              )}
            ></span>
          </div>

          <div className="flex-1">
            <h5>
              <strong>{meeting.guestName}</strong>
            </h5>
            <p>
              Event type <strong> {meeting.event.title}</strong>
            </p>
          </div>
          {/* {Meeting detail Button} */}
          <div className="flex shrink-0">
            <button className="flex gap-px items-center cursor-pointer !text-[rgba(26,26,26,0.61)] text-base leading-[1.4] whitespace-nowrap">
              <ChevronDown
                fill="rgba(26,26,26,0.61)"
                className=" w-6 h-6
               !fill-[rgba(26,26,26,0.61)]"
              />
              More
            </button>
          </div>
        </div>
      </div>

      {/* {Event Details} */}
      {/* {Event Details} */}
      {/* {Event Details} */}
      <div
        ref={detailsRef}
        className="event-details overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isShow ? `${detailsRef.current?.scrollHeight}px` : "0px",
          padding: isShow ? "8px 24px 24px 24px" : "0 24px",
        }}
      >
        <div className="flex flex-col-reverse md:flex-row pb-5">
          {period === PeriodEnum.UPCOMING && (
            <div className="box-border shrink-0 w-[80%] md:w-[310px] pr-[80px] pl-[40px] mb-5">
              <div>
                <Button
                  variant="outline"
                  type="button"
                  className="!w-full border-[#476788] text-[#0a2540] font-normal text-sm"
                  onClick={onCancel}
                >
                  {isPending ? (
                    <Loader color="black" />
                  ) : (
                    <Fragment>
                      <Trash2Icon />
                      <span>Cancel</span>
                    </Fragment>
                  )}
                </Button>
              </div>
            </div>
          )}
          <div className="flex-1">
            <ul>
              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Email
                </h5>
                <p className="font-normal text-[15px]">{meeting.guestEmail}</p>
              </li>
              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Location
                </h5>
                <div className="flex items-center mr-6">
                  {locationOption && (
                    <>
                      <img
                        src={locationOption?.logo as string}
                        alt={locationOption?.label}
                        className="w-5 h-5 mr-2"
                      />
                      <span className="mt-1 font-normal text-[15px]">
                        {locationOption?.label}
                      </span>
                    </>
                  )}
                </div>
              </li>
              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Questions
                </h5>
                <p className="font-normal text-[15px]">
                  {meeting.additionalInfo ? (
                    meeting.additionalInfo
                  ) : (
                    <Fragment>
                      <span className="block font-light text-sm mb-1 text-[rgba(26,26,26,0.61)]">
                        Please share anything that will help prepare for our
                        meeting.
                      </span>
                      <span>Nothing</span>
                    </Fragment>
                  )}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
