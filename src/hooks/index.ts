import {
  Datapoint,
  FieldName,
  NavigationItem,
  fieldIsDatapoint,
  fieldValueIsString,
} from '@/types';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useMemo, ChangeEvent } from 'react';

// this function returns the field names present in a given datapoint
function getPresentFieldNames(dp: Datapoint): string[] {
  const fieldNames: string[] = [];
  for (const key of Object.keys(dp)) {
    const value = dp[key];
    if (!fieldIsDatapoint(value) && !fieldValueIsString(value)) {
      continue;
    }
    if (fieldIsDatapoint(value)) {
      const nestedFieldNames = getPresentFieldNames(value).map(
        (fn) => `${key}.${fn}`,
      );
      fieldNames.push(...nestedFieldNames);
      continue;
    }
    if (fieldValueIsString(value)) {
      fieldNames.push(key);
      continue;
    }
  }
  return fieldNames;
}

// this function parses a fieldname and returns the value of that field
export function getFieldValue(dp: Datapoint, fieldName: FieldName): string {
  const fieldParts = fieldName.split('.');
  let cursor: Datapoint | string = dp;
  for (const part of fieldParts) {
    cursor = cursor[part] as Datapoint | string;
    // what we want
    if (typeof cursor === 'string') {
      break;
    }
  }
  if (typeof cursor !== 'string') {
    throw new Error(`field ${fieldName} is not a string`);
  }
  return cursor;
}

export function useDatapoints() {
  const [error, setError] = useState('');
  const [datapoints, setDatapoints] = useState<Datapoint[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedFields, setSelectedFields] = useState<FieldName[]>([]);
  const [fieldToAdd, setFieldToAdd] = useState<FieldName | undefined>(
    undefined,
  );

  const updateDatapoints = useCallback((data: Datapoint[]) => {
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
    (operation: 'increment' | 'decrement') => {
      switch (operation) {
        case 'decrement':
          if (0 < index) {
            setIndex((i) => i - 1);
          }
          break;
        case 'increment':
          if (index < datapoints.length - 1) {
            setIndex((i) => i + 1);
          }
      }
    },
    [datapoints.length, index],
  );

  const allFieldNames = useMemo(() => {
    if (datapoints.length === 0) {
      return [];
    }
    const allFieldNames = getPresentFieldNames(datapoints[index]);
    return allFieldNames;
  }, [datapoints, index]);

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
      console.log('received change event: ', candidate);
      if (candidate.length === 0) {
        console.log('candidate is length 0');
        return;
      }
      setFieldToAdd(candidate as FieldName);
    },
    [],
  );

  const handleAddFieldClick = useCallback(() => {
    // ignore invalid entry
    console.log('received click event');
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
      console.log('invalid fieldname to add: ', fieldToAdd);
      return;
    }
    // add the field to the list of selected fields, clear the entry screen
    setSelectedFields((sf) => [...sf, fieldToAdd]);
    setFieldToAdd(undefined);
  }, [availableFields, fieldToAdd]);

  const removeFieldName = (fn: FieldName) => {
    setSelectedFields((fields) => fields.filter((f) => f !== fn));
  };

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files![0];
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const data = JSON.parse(event.target!.result as string);
          if (!Array.isArray(data)) {
            setError(
              'Provided file is not in list format. Please see instructions for file format.',
            );
            return;
          }
          // successful parse
          updateDatapoints(data as Datapoint[]);
          setError('');
        } catch (e) {
          console.log('got error parsing file:', e);
          setError(e as string);
          return;
        }
      };
      reader.readAsText(file);
    },
    [updateDatapoints],
  );

  return {
    error,
    allFieldNames,
    handleFileChange,
    datapoints,
    handleFieldSelectChange,
    handleAddFieldClick,
    index,
    changeIndex,
    selectedFields,
    removeFieldName,
    availableFields,
  };
}

export function useFieldSelect(fieldNames: FieldName[]) {
  const [selectedField, setSelectedField] = useState<FieldName | undefined>(
    fieldNames[0] ?? undefined,
  );
  // update this as the field names change so that we are always displaying valid names
  useEffect(() => {
    if (!selectedField && fieldNames.length === 0) {
      return;
    }
    if (!selectedField && fieldNames.length > 0) {
      setSelectedField(fieldNames[0]);
      return;
    }
    if (fieldNames.length === 0) {
      setSelectedField(undefined);
      return;
    }

    // update the field name to include one that exists
    if (!fieldNames.includes(selectedField!)) {
      const defaultField = fieldNames[0];
      setSelectedField(defaultField);
      return;
    }
  }, [fieldNames, selectedField]);
  const handleChangeField = useCallback((fn: FieldName) => {
    setSelectedField(fn);
  }, []);
  return { selectedField, handleChangeField };
}

export function useNavigation() {
  const { route } = useRouter();
  const navigation: NavigationItem[] = [
    { name: 'Diff Viewer', href: '/', current: false },
    { name: 'Multi-File Viewer', href: '/multi-file', current: false },
  ];
  console.log('route: ', route);
  return navigation.map((nav) => {
    return { ...nav, current: nav.href === route };
  });
}
