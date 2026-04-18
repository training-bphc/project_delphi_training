export interface SelectOption {
  value: string;
  label: string;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
