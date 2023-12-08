export type Datapoint = {
  backport_before: string;
  backport_after: string;
  upstream_before: string;
  upstream_after: string;
  backport_patch: string;
  upstream_patch: string;
  generated_patch: string;
  extracted_patch: string;
};

export type FieldName = keyof Datapoint;

export type NavigationItem = {
  href: string;
  name: string;
  current: boolean;
};
