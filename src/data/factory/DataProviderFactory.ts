import { ENV } from "../../../config/envLoader";

import { IDataProvider } from "../providers/IDataProvider";
import { JsonProvider } from "../providers/JsonProvider";
import { YamlProvider } from "../providers/YamlProvider";

type ProviderConstructor = new () => IDataProvider;

export class DataProviderFactory {
  private static readonly providers: Record<string, ProviderConstructor> = {
    json: JsonProvider,

    yaml: YamlProvider,
  };

  static create(): IDataProvider {
    const Provider = this.providers[ENV.TEST_DATA_FORMAT];

    if (!Provider) {
      throw new Error(`Unsupported TEST_DATA_FORMAT: ${ENV.TEST_DATA_FORMAT}`);
    }

    return new Provider();
  }
}
