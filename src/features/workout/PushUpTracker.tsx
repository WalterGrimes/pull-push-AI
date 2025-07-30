import React, { useEffect } from "react";
import { usePushUpTracker } from "../hooks/use-pushup-tracker";
import { ExerciseTracker } from "@/shared/ui/trackers";

interface PushUpTrackerProps {
  results: Results | null;
  onExerciseComplete?: (count: number) => void;
}

const PushUpTracker: React.FC<PushUpTrackerProps> = React.memo(({
  results,
  onExerciseComplete
}) => {
  const { count, feedback, showFeedback, progress } = usePushUpTracker(
    results,
    onExerciseComplete
  );

  return (
    <ExerciseTracker
      exercise="pushup"
      count={count}
      feedback={feedback}
      showFeedback={showFeedback}
      progress={progress}
    />
  );
});

export default PushUpTracker;