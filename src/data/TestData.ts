import { DataProviderFactory } from "./factory/DataProviderFactory";

export class TestData {
  private static readonly provider = DataProviderFactory.create();

  static load<T>(fileName: string): Promise<T> {
    return this.provider.load<T>(fileName);
  }
}
