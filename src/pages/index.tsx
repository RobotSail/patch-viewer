import { Inter } from "next/font/google";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";

const inter = Inter({ subsets: ["latin"] });

type Datapoint = {
  backport_before: string;
  backport_after: string;
  upstream_before: string;
  upstream_after: string;
  backport_patch: string;
  upstream_patch: string;
  generated_patch: string;
  extracted_patch: string;
};

type FieldName = keyof Datapoint;

// this function returns the field names present in a given datapoint
function getPresentFieldNames(dp: Partial<Datapoint>): FieldName[] {
  const completeDatapoint: Datapoint = {
    backport_after: "",
    backport_before: "",
    backport_patch: "",
    extracted_patch: "",
    generated_patch: "",
    upstream_after: "",
    upstream_before: "",
    upstream_patch: "",
  };
  const containedFields: FieldName[] = [];
  for (const key of Object.keys(completeDatapoint)) {
    if (key in dp) {
      containedFields.push(key as FieldName);
    }
  }

  return containedFields;
}

function useDatapoints() {
  const [datapoints, setDatapoints] = useState<Partial<Datapoint>[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedFields, setSelectedFields] = useState<FieldName[]>([]);
  const [fieldToAdd, setFieldToAdd] = useState<FieldName | undefined>(
    undefined,
  );

  const updateDatapoints = useCallback((data: Partial<Datapoint>[]) => {
    setDatapoints(data);
    setIndex(0);
  }, []);

  // reset the selected fields whenever a new datapoint is loaded
  useEffect(() => {
    if (datapoints.length === 0) {
      return;
    }
    const availableFields = getPresentFieldNames(datapoints[index]);
    // do nothing
    if (availableFields.length === 0) {
      setSelectedFields([]);
      return;
    }
    setSelectedFields([availableFields[0]]);
  }, [datapoints, index]);

  const changeIndex = useCallback(
    (operation: "increment" | "decrement") => {
      switch (operation) {
        case "decrement":
          if (0 < index) {
            setIndex((i) => i - 1);
          }
          break;
        case "increment":
          if (index < datapoints.length - 1) {
            setIndex((i) => i + 1);
          }
      }
    },
    [datapoints.length, index],
  );

  const availableFields = useMemo(() => {
    if (datapoints.length === 0) {
      return [];
    }
    const allFieldNames = getPresentFieldNames(datapoints[index]);
    return allFieldNames.filter((fn) => !selectedFields.includes(fn));
  }, [datapoints, index, selectedFields]);

  const handleFieldSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const candidate = e.target.value;
      console.log("received change event: ", candidate);
      if (candidate.length === 0) {
        console.log("candidate is length 0");
        return;
      }
      setFieldToAdd(candidate as FieldName);
    },
    [],
  );

  const handleAddFieldClick = useCallback(() => {
    // ignore invalid entry
    console.log("received click event");
    if (!fieldToAdd) {
      if (availableFields.length === 0) {
        return;
      }
      const defaultField = availableFields[0];
      setSelectedFields((sf) => [...sf, defaultField]);
      setFieldToAdd(undefined);
      return;
    }
    if (fieldToAdd.length === 0) {
      console.log("invalid fieldname to add: ", fieldToAdd);
      return;
    }
    // add the field to the list of selected fields, clear the entry screen
    setSelectedFields((sf) => [...sf, fieldToAdd]);
    setFieldToAdd(undefined);
  }, [availableFields, fieldToAdd]);

  const removeFieldName = (fn: FieldName) => {
    setSelectedFields((fields) => fields.filter((f) => f !== fn));
  };

  return {
    datapoints,
    handleFieldSelectChange,
    handleAddFieldClick,
    updateDatapoints,
    index,
    changeIndex,
    selectedFields,
    removeFieldName,
    availableFields,
  };
}
type FileDiffViewerProps = {
  data: string;
  fieldName: string;
  onCloseClick: () => void;
};
function FileDiffViewer({
  data,
  fieldName,
  onCloseClick,
}: FileDiffViewerProps) {
  return (
    <div>
      <div className="fixed -translate-y-8">
        <div className="flex flex-row  space-x-2 px-2 bg-gray-300">
          <button
            onClick={onCloseClick}
            className="bg-red-400 hover:bg-red-300 px-2"
          >
            X
          </button>
          <h1 className="">
            Viewing: <span className="font-bold">{fieldName}</span>
          </h1>
        </div>
      </div>
      <div
        className="border-gray-200 overflow-y-scroll bg-gray-50 border p-4"
        style={{
          width: "726px",
          height: "1024px",
        }}
      >
        <Markdown>
          {`\`\`\`diff
${data}
\`\`\``}
        </Markdown>
      </div>
    </div>
  );
}

type FileViewerContainerProps = {
  datapoint: Partial<Datapoint>;
  selectedFields: FieldName[];
  removeField: (fieldName: FieldName) => void;
  availableFields: FieldName[];
  onFieldSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onAddFieldClick: () => void;
};
// function FileViewerContainer({
//   datapoint,
//   selectedFields,
//   availableFields,
//   removeField,
//   onAddFieldClick,
//   onFieldSelectChange,
// }: FileViewerContainerProps) {
//   return (
//     <div className="flex flex-row max-h-[80%] overflow-x-scroll ">
//       {selectedFields.map((sf, i) => {
//         return (
//           <div key={`field-viewer-${i}`}>
//             <FileDiffViewer
//               data={datapoint[sf]!}
//               fieldName={sf}
//               onCloseClick={() => removeField(sf)}
//             />
//           </div>
//         );
//       })}
//       {availableFields.length > 0 && (
//         <div className="w-48 h-fit text-center border border-black">
//           <h1 className="text-lg">Add Field View</h1>
//           <select onChange={onFieldSelectChange}>
//             {availableFields.map((af, i) => (
//               <option value={af} key={`available-fieldname-${i}`}>
//                 {af}
//               </option>
//             ))}
//           </select>
//           <button className="bg-gray-100" onClick={onAddFieldClick}>
//             Add a File
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
function FileViewerContainer({
  datapoint,
  selectedFields,
  availableFields,
  removeField,
  onAddFieldClick,
  onFieldSelectChange,
}: FileViewerContainerProps) {
  return (
    <div className="flex overflow-x-auto whitespace-nowrap">
      {selectedFields.map((sf, i) => {
        return (
          <div key={`field-viewer-${i}`} className="flex-shrink-0">
            <FileDiffViewer
              data={datapoint[sf]!}
              fieldName={sf}
              onCloseClick={() => removeField(sf)}
            />
          </div>
        );
      })}
      {availableFields.length > 0 && (
        <div className="w-48 h-fit text-center border border-black inline-block">
          <h1 className="text-lg">Add Field View</h1>
          <select onChange={onFieldSelectChange}>
            {availableFields.map((af, i) => (
              <option value={af} key={`available-fieldname-${i}`}>
                {af}
              </option>
            ))}
          </select>
          <button className="bg-gray-100" onClick={onAddFieldClick}>
            Add a File
          </button>
        </div>
      )}
    </div>
  );
}

type DatasetControllerProps = {
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  index: number;
  datasetLength: number;
  onPreviousClick: () => void;
  onNextClick: () => void;
};

function DatasetController(props: DatasetControllerProps) {
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
        <button
          className="bg-gray-100 px-2 py-1 border border-black rounded-sml"
          onClick={props.onPreviousClick}
        >
          Previous
        </button>
        <button
          className="bg-gray-100 px-2 py-1 border border-black rounded-sml"
          onClick={props.onNextClick}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    changeIndex,
    datapoints,
    index,
    updateDatapoints,
    selectedFields,
    removeFieldName,
    availableFields,
    handleAddFieldClick,
    handleFieldSelectChange,
  } = useDatapoints();
  const [error, setError] = useState("");
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files![0];
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const data = JSON.parse(event.target!.result as string);
          if (!Array.isArray(data)) {
            setError(
              "Provided file is not in list format. Please see instructions for file format.",
            );
            return;
          }
          // successful parse
          updateDatapoints(data as Datapoint[]);
          setError("");
        } catch (e) {
          console.log("got error parsing file:", e);
          setError(e as string);
          return;
        }
      };
      reader.readAsText(file);
    },
    [updateDatapoints],
  );
  return (
    <main
      className={`flex h-screen w-screen  flex-col items-center  p-24 ${inter.className}`}
    >
      {error.length > 0 && (
        <div className="bg-red-400 text-white p-4">{error}</div>
      )}
      <DatasetController
        datasetLength={datapoints.length}
        index={index}
        handleFileChange={handleFileChange}
        onNextClick={() => changeIndex("increment")}
        onPreviousClick={() => changeIndex("decrement")}
      />
      <FileViewerContainer
        datapoint={datapoints[index]}
        removeField={removeFieldName}
        selectedFields={selectedFields}
        availableFields={availableFields}
        onAddFieldClick={handleAddFieldClick}
        onFieldSelectChange={handleFieldSelectChange}
      />
    </main>
  );
}
