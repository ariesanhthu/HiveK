export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

export type JsonRecord = Record<string, unknown>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type ClassType<T = any> = new (...args: any[]) => T;
