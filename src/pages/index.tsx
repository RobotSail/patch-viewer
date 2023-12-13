import { DatasetController } from '@/components/data-controller';
import Layout from '@/components/layout';
import Select from '@/components/ui/select';
import { getFieldValue, useDatapoints, useFieldSelect } from '@/hooks';
import { FieldName } from '@/types';
import { useState } from 'react';
import DiffViewer from 'react-diff-viewer-continued';

export default function DiffViewerPage() {
  const { changeIndex, datapoints, handleFileChange, index, allFieldNames } =
    useDatapoints();
  const {
    handleChangeField: handleChangeLeftField,
    selectedField: selectedLeftField,
  } = useFieldSelect(allFieldNames);
  const {
    handleChangeField: handleChangeRightField,
    selectedField: selectedRightField,
  } = useFieldSelect(allFieldNames);

  return (
    <Layout title="Diff Viewer">
      <DatasetController
        datasetLength={datapoints.length}
        handleFileChange={handleFileChange}
        index={index}
        onNextClick={() => changeIndex('increment')}
        onPreviousClick={() => changeIndex('decrement')}
      />
      <div>
        {selectedLeftField && (
          <Select
            label="Select left field"
            onSelectChange={handleChangeLeftField}
            options={allFieldNames}
            selected={selectedLeftField}
          />
        )}
        {selectedRightField && (
          <Select
            label="Select right field"
            onSelectChange={handleChangeRightField}
            options={allFieldNames}
            selected={selectedRightField}
          />
        )}
      </div>
      {datapoints[index] && selectedLeftField && selectedRightField && (
        <DiffViewer
          leftTitle={selectedLeftField}
          rightTitle={selectedRightField}
          oldValue={getFieldValue(datapoints[index], selectedLeftField)}
          newValue={getFieldValue(datapoints[index], selectedRightField)}
        />
      )}
    </Layout>
  );
}
