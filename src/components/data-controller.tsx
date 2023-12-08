import { ChangeEvent } from "react";
import Button from "./ui/button";

type DatasetControllerProps = {
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  index: number;
  datasetLength: number;
  onPreviousClick: () => void;
  onNextClick: () => void;
};

export function DatasetController(props: DatasetControllerProps) {
  return (
    <div className="flex flex-col justify-center mb-8">
      <input
        type="file"
        accept="application/json"
        onChange={props.handleFileChange}
      />
      <div className="mt-4 text-center">
        Viewing Datapoint {Math.min(props.index + 1, props.datasetLength)} out
        of {props.datasetLength}
      </div>
      <div className="mx-auto space-x-4 mt-2">
        <Button onClick={props.onPreviousClick}>Previous</Button>
        <Button onClick={props.onNextClick}>Next</Button>
      </div>
    </div>
  );
}
