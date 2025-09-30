import {en as LocaleEnType} from "src/i18n/resources"

export {};

declare global {

  declare module "*.svg" {
    import React from "react";
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;

    export default content;
  }

  type RecursiveKeyOf<TObj extends Record<string, unknown>> = {
    [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, unknown>
      ? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
      : PrefixContextI18next<TKey>;
    }[keyof TObj & string];

  /**Key access for i18n type */
  type MultiLangKey = RecursiveKeyOf<typeof LocaleEnType>;

}