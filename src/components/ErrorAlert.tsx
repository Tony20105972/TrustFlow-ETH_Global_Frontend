import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  message: string | object | any;
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
  const errorMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        ❌ Backend error: {errorMessage}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;