export function fieldValueIsString(field: FieldValue): field is string {
  return typeof field === 'string';
}

export function fieldIsDatapoint(
  field: FieldValue | Datapoint,
): field is Datapoint {
  // test to see if the field is an object with keys
  // if it is, then it is a datapoint
  return (
    typeof field === 'object' && field !== null && Object.keys(field).length > 0
  );
}

type FieldValue = string | number | boolean | null | unknown[];

export type Datapoint = {
  [key: string]: FieldValue | Datapoint;
};

export type FieldName = string;
export type NavigationItem = {
  href: string;
  name: string;
  current: boolean;
};
