/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connectAppIntegrationQueryFn } from "@/lib/api";
import {
  IntegrationAppEnum,
  IntegrationAppType,
  IntegrationDescriptions,
  IntegrationLogos,
} from "@/lib/types";
import { PlusIcon } from "lucide-react";

interface IntegrationCardProps {
  appType: IntegrationAppType;
  title: string;
  isConnected?: boolean;
  isDisabled?: boolean;
}

interface ImageWrapperProps {
  src: string;
  alt: string;
  height?: number;
  width?: number;
  className?: string;
}

const SUCCESS_MESSAGES: Record<any, string> = {
  [IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR]:
    "Google Calendar connected successfully!",
};

const ERROR_MESSAGES: Record<any, string> = {
  [IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR]:
    "Failed to connect Google Calendar. Please try again.",
};

const IntegrationCard = ({
  appType,
  title,
  isConnected = false,
  isDisabled = false,
}: IntegrationCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationAppType | null>(
    null
  );

  const logos = IntegrationLogos[appType];
  const description = IntegrationDescriptions[appType];

  const handleConnect = async (appType: IntegrationAppType) => {
    setSelectedType(appType);
    setIsLoading(true);
    try {
      const { url } = await connectAppIntegrationQueryFn(appType);
      console.log(SUCCESS_MESSAGES[appType], url);
      setSelectedType(null);
      window.location.href = url;
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to connect Google Calendar:", error);
      toast.error(ERROR_MESSAGES[appType]);
    }
  };

  return (
    <Card className="flex w-full items-center justify-between shadow-none border-0">
      <CardHeader className="flex flex-col gap-4">
        {Array.isArray(logos) ? (
          <div className="flex items-center gap-4">
            <ImageWrapper src={logos[0]} alt="Google Meet logo" />
            <span className="mx-1">
              <PlusIcon className="w-5 h-5" />
            </span>
            <ImageWrapper src={logos[1]} alt="Google Calendar logo" />
          </div>
        ) : (
          <ImageWrapper src={logos} alt={`${title} logo`} />
        )}
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        {isConnected ? (
          <div
            className="inline-flex items-center 
              justify-center min-h-[44px] text-sm
              border border-primary
              text-primary
               p-[8px_16px] rounded-full font-bold w-[180px]"
          >
            Connected
          </div>
        ) : (
          <Button
            onClick={() => handleConnect(appType)}
            variant="unstyled"
            className={`shrink-0 inline-flex items-center 
              justify-center min-h-[44px] text-sm font-semibold
               p-[8px_16px] rounded-full w-[180px] disabled:pointer-events-none
               ${
                 isDisabled
                   ? "pointer-events-none opacity-80 border border-gray-200 text-muted-foreground bg-transparent"
                   : "bg-primary text-primary-foreground"
               }`}
            aria-disabled={isDisabled}
            disabled={isLoading}
          >
            {isLoading && selectedType === appType ? (
              <Loader size="sm" color="white" />
            ) : (
              <span>{isDisabled ? "Not available" : "Connect"}</span>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};

export const ImageWrapper: React.FC<ImageWrapperProps> = ({
  src,
  alt,
  height = 30,
  width = 30,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full size-[50px] ${className}`}
      style={{ boxShadow: "0 2px 5px 0 rgb(0 0 0 / 27%)" }}
    >
      <img
        src={src}
        alt={alt}
        height={height}
        width={width}
        className="object-cover"
      />
    </div>
  );
};

export default IntegrationCard;
