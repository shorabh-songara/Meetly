import { useQuery } from "@tanstack/react-query";
import PageTitle from "@/components/PageTitle";
import { Card, CardContent } from "@/components/ui/card";
import WeeklyHoursRow from "./_components/weekly-hours";
import { Separator } from "@/components/ui/separator";
import { ClockIcon } from "lucide-react";
import { getUserAvailabilityQueryFn } from "@/lib/api";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";

const Availability = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user_availability"],
    queryFn: getUserAvailabilityQueryFn,
  });

  const availability = data?.availability;

  const days = availability?.days || [];
  const timeGap = availability?.timeGap || 30;

  return (
    <div className="flex flex-col !gap-3">
      <PageTitle title="Availability" />

      <ErrorAlert isError={isError} error={error} />

      <div className="w-full">
        {isLoading || isError ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <Loader size="lg" color="black" />
          </div>
        ) : (
          <Card className="p-0 shadow-[0_1px_6px_0_rgb(0_0_0_/_10%)]min-h-[220px] border border-[#D4E16F)] bg-white rounded-[8px]">
            <CardContent className="!py-[24px] px-0 !pb-10">
              <div>
                <fieldset>
                  <legend>
                    <h3 className="text-lg px-[24px] inline-flex gap-1 font-bold tracking-wide mb-3">
                      <ClockIcon />
                      <span>Weekly hours</span>
                    </h3>
                  </legend>
                  <Separator className="bg-[#D4E16F]" />
                  <div className="w-full max-w-lg px-[24px]">
                    <WeeklyHoursRow days={days} timeGap={timeGap} />
                  </div>
                </fieldset>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Availability;
