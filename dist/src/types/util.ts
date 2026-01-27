type SnakeToCamelCase<S extends string> = S extends `${infer First}_${infer Rest}` ? `${First}${Capitalize<SnakeToCamelCase<Rest>>}` : S

type SnakeToCamel<T> = T extends object
  ? {
      [K in keyof T as SnakeToCamelCase<K & string>]: T[K] extends (infer U)[] ? SnakeToCamel<U>[] : SnakeToCamel<T[K]>
    }
  : T
