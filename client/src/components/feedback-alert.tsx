import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

interface FeedbackAlertProps {
  message: FeedbackMessage;
}

export function FeedbackAlert({ message }: FeedbackAlertProps) {
  return (
    <Alert
      className={`mb-4 ${
        message.type === "success"
          ? "bg-green-50 text-green-900"
          : "bg-red-50 text-red-900"
      }`}
    >
      <div className="flex items-center gap-2">
        {message.type === "success" ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        <AlertTitle>{message.text}</AlertTitle>
      </div>
    </Alert>
  );
}