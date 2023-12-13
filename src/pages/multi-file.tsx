import { DatasetController } from '@/components/data-controller';
import Layout from '@/components/layout';
import { getFieldValue, useDatapoints } from '@/hooks';
import { Datapoint, FieldName } from '@/types';
import { Inter } from 'next/font/google';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';

const inter = Inter({ subsets: ['latin'] });

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
    <div className="flex-shrink-0">
      <div className="sticky -translate-y-8">
        <div className="flex flex-row  justify-between px-2 bg-gray-300">
          <h1 className="">
            Viewing: <span className="font-bold">{fieldName}</span>
          </h1>
          <button
            onClick={onCloseClick}
            className="bg-red-400 hover:bg-red-300 px-2"
          >
            X
          </button>
        </div>
      </div>
      <div
        className="border-gray-200 overflow-y-scroll bg-gray-50 border p-4"
        style={{
          width: '726px',
          height: '1024px',
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
  datapoint: Datapoint;
  selectedFields: FieldName[];
  removeField: (fieldName: FieldName) => void;
  availableFields: FieldName[];
  onFieldSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onAddFieldClick: () => void;
};

function FileViewerContainer({
  datapoint,
  selectedFields,
  availableFields,
  removeField,
  onAddFieldClick,
  onFieldSelectChange,
}: FileViewerContainerProps) {
  return (
    <div className="flex flex-row ">
      {selectedFields.map((sf, i) => {
        return (
          // <div key={`field-viewer-${i}`} className="flex-shrink-0">
          <FileDiffViewer
            data={getFieldValue(datapoint, sf)}
            fieldName={sf}
            onCloseClick={() => removeField(sf)}
            key={`field-viewer-${i}`}
          />
          // </div>
        );
      })}
      {availableFields.length > 0 && (
        <div className="w-48 h-fit text-center border border-black">
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

export default function Home() {
  const {
    changeIndex,
    datapoints,
    index,
    selectedFields,
    removeFieldName,
    availableFields,
    handleAddFieldClick,
    handleFieldSelectChange,
    error,
    handleFileChange,
  } = useDatapoints();
  return (
    <Layout title="Multi-File Viewer">
      <main
        className={`flex h-screen  flex-col items-center  p-24 ${inter.className}`}
      >
        {error.length > 0 && (
          <div className="bg-red-400 text-white p-4">{error}</div>
        )}
        <DatasetController
          datasetLength={datapoints.length}
          index={index}
          handleFileChange={handleFileChange}
          onNextClick={() => changeIndex('increment')}
          onPreviousClick={() => changeIndex('decrement')}
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
    </Layout>
  );
}
