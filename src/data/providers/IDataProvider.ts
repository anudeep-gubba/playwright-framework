export interface IDataProvider {
  load<T>(fileName: string): Promise<T>;
}
