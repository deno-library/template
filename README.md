# template
Template engine for Deno

## Usage

### render
```ts
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
const tpl = new Template();
const str = tpl.render("abc{{name}}{{name2}}def\n{{fn}}s{{p.arr}}ww", {
  name: "def",
  fn: () => 1,
  p: { arr: [{ M: "w" }, 2, 3] },
  age: 30,
});
assert(
  str ===
    "abcdef{{name2}}def\n() =&gt; 1s[{&quot;M&quot;:&quot;w&quot;},2,3]ww",
);
```

### compile
Reuse compiled function
```ts
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
const tpl = new Template();
const compiled = tpl.compile("abc{{name}}");
const str1 = tpl.renderCompiled(compiled, { name: "def" });
const str2 = tpl.renderCompiled(compiled, { name: "xyz" });
assert(str1 === "abcdef");
assert(str2 === "abcxyz");
```

### not escape
```ts
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
const tpl = new Template({
  isEscape: false,
});
const str = "abc{{name}}{{name2}}def\n{{fn}}s{{p.arr}}ww";
const result = 'abcdef{{name2}}def\n() => 1s[{"M":"w"},2,3]ww';
const data = {
  name: "def",
  fn: () => 1,
  p: { arr: [{ M: "w" }, 2, 3] },
  age: 30,
};
// render
assertEquals(tpl.render(str, data), result);

// renderCompiled
const compiled = tpl.compile(str);
assertEquals(tpl.renderCompiled(compiled, data), result);
```

### open and close
```ts
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
const tpl = new Template({
  open: "<%",
  close: "%>",
});

// render
assertEquals(tpl.render("abc<%name%>", { name: "def" }), "abcdef");

// renderCompiled
const compiled = tpl.compile("abc<%name%>");
const str = tpl.renderCompiled(compiled, { name: "def" });
assertEquals(str, "abcdef");
```

### renderFile
Compiled functions are cached
```ts
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
const tpl = new Template();
const data = { name: "def" };
const result = tpl.renderFile("./index.html", data);
```

## Interface
```ts
export interface ConstructorOptions {
  open?: string;       // Open tag, default: {{
  close?: string;      // Closing tag, default: }}
  isEscape?: boolean;  // Whether to escape the value of parameter data, default: true
}

class Template {
  constructor(options?: ConstructorOptions)
  
  render(str: string, data: object): string;
  compile(str: string): string;
  renderCompiled(compiled: Function, data: object): string;
  renderFile(path: string, data: object): string;
}
```