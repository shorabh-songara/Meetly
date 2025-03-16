import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ENV } from "@/lib/get-env";
import { cn } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface PropsType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  isPrivate: boolean;
  username: string;
  isPending: boolean;
  onToggle: () => void;
}

const EventCard: FC<PropsType> = ({
  title,
  duration,
  slug,
  isPrivate = false,
  username,
  isPending,
  onToggle,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const event_link = `${ENV.VITE_APP_ORIGIN}/${username}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(event_link)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("Event link copied");
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
      });
  };
  return (
    <div>
      <Card
        className={cn(
          `!p-0 !ring-0 w-full max-w-[400px]
        box-border min-h-[220px] border border-[#CCCCCC)] bg-white rounded-[4px]
        shadow-[0_1px_6px_0_rgb(0_0_0_/_10%)]`,
          isPrivate && "bg-transparent"
        )}
      >
        <CardContent className="relative flex flex-col p-0">
          <div
            className={cn(
              `bg-[rgb(130,71,245)]
          h-[6px] -mt-[1px] -mr-[1px] -ml-[1px] rounded-tl-[4px] rounded-tr-[4px]
          `,
              isPrivate && "bg-[#B2B2B2]"
            )}
          ></div>
          <div className="flex items-center justify-between p-[12px_16px]">
            <div>
              <label htmlFor="">
                <Checkbox id="" />
              </label>
            </div>
          </div>

          {/* {Event details} */}
          <div className="w-full flex flex-col p-[5px_16px_18px_16px]">
            <h2
              className={cn(
                `text-lg font-normal`,
                isPrivate && "text-[rgba(26,26,26,0.61)]"
              )}
            >
              {title}
            </h2>
            <p className="text-[#476788]">{duration} minutes</p>
            <Link
              target="_blank"
              to={event_link}
              rel="noopener noreferrer"
              className={cn(
                `pt-2 text-[#004eba]`,
                isPrivate && "pointer-events-none opacity-60"
              )}
            >
              View booking page
            </Link>
          </div>
        </CardContent>
        <CardFooter
          className="p-[12px_8px_12px_16px] 
        border-t border-[#D4E162] h-full flex items-center justify-between"
        >
          <Button
            variant="ghost"
            disabled={isPrivate}
            className="flex items-center gap-2 cursor-pointer font-light text-sm text-[rgb(0,105,255)]
            disabled:text-[rgba(26,26,26,0.61)] disabled:bg-[#e7edf6] disabled:opacity-100
                      "
            onClick={handleCopyLink}
          >
            <CopyIcon className="w-4 h-4" />
            <span>{isCopied ? "Copied!" : "Copy link"}</span>
          </Button>

          <Button
            variant="outline"
            className={cn(
              "!p-[8px_16px] text-sm font-normal !h-[37px] cursor-pointer disabled:pointer-events-none",
              isPrivate && "!border-[#445d76] !text-[#0a2540] z-30 "
            )}
            disabled={isPending}
            onClick={onToggle}
          >
            {isPending ? (
              <Loader size="sm" color="black" />
            ) : (
              <span>Turn {isPrivate ? "On" : "Off"}</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventCard;
