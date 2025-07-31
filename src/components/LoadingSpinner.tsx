import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner = ({ text = "Loading..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
};

export default LoadingSpinner;