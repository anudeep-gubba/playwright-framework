export interface IDataProvider {
  load<T>(fileName: string): T;
}
