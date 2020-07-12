type Data = Record<string, unknown>;

export interface ConstructorOptions {
  open?: string;
  close?: string;
  isEscape?: boolean;
}

export interface CompiledFunction extends Function {
  (data: Data, fn: Function): string;
}

export default class Template {
  open: string;
  close: string;
  cache: Map<string, CompiledFunction> = new Map();
  decoder = new TextDecoder();
  isEscape: boolean;

  constructor(options?: ConstructorOptions) {
    this.open = options?.open ?? "{{";
    this.close = options?.close ?? "}}";
    this.isEscape = options?.isEscape ?? true;
  }

  render(str: string, data: Data): string {
    const reg = new RegExp(`${this.open}([\\s\\S]+?)${this.close}`, "g");
    const result = str.replace(reg, (match, key: string): string => {
      let value: any = data;
      key.replace(/ /g, "").split(".").forEach((key) => {
        value = value[key];
      });
      if (value === undefined) return match;
      return this.escape(value);
    });

    return result;
  }

  compile(str: string): CompiledFunction {
    const reg = new RegExp(`${this.open}([\\s\\S]+?)${this.close}`, "g");
    const result = str.replace(/\n/g, "\\n")
      .replace(reg, (match, key: string): string => {
        key = key.trim();
        return `' + (obj.${key} ? escape(obj.${key}) : '${match}') + '`;
      });
    const tpl = `let tpl = '${result}'\n return tpl;`;
    return new Function("obj", "escape", tpl) as CompiledFunction;
  }

  renderCompiled(compiled: CompiledFunction, data: Data): string {
    return compiled(data, this.escape.bind(this));
  }

  async renderFile(path: string, data: Data): Promise<string> {
    if (this.cache.has(path)) {
      return this.renderCompiled(this.cache.get(path)!, data);
    }
    const buf = await Deno.readFile(path);
    const str = this.decoder.decode(buf);
    const compiled = this.compile(str);
    this.cache.set(path, compiled);
    return compiled(data, this.escape.bind(this));
  }

  escape(str: any): string {
    if (typeof str === "object") {
      str = JSON.stringify(str);
    }
    str = String(str);
    if (this.isEscape === false) return str;
    return str.replace(/&(?!\w+;)/g, "&amp;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
