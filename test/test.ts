import { assertEquals } from "jsr:@std/assert";
import Template from "../mod.ts";

Deno.test("open close", () => {
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
});

Deno.test("escape", () => {
  const str = "abc{{name}}{{name2}}def\n{{fn}}s{{p.arr}}ww";
  const data = {
    name: "def",
    fn: () => 1,
    p: { arr: [{ M: "w" }, 2, 3] },
    age: 30,
  };
  const result =
    "abcdef{{name2}}def\n() =&gt; 1s[{&quot;M&quot;:&quot;w&quot;},2,3]ww";
  const tpl = new Template();

  // render
  assertEquals(tpl.render(str, data), result);

  // renderCompiled
  const compiled = tpl.compile(str);
  assertEquals(tpl.renderCompiled(compiled, data), result);
});

Deno.test("not escape", () => {
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
});

Deno.test("renderFile", async () => {
  const tpl = new Template();
  const result = new TextDecoder().decode(
    await Deno.readFile("./test/index2.html"),
  );
  const result2 =
    "<div>abcdef{{name2}}def\n() =&gt; 1s[{&quot;M&quot;:&quot;w&quot;},2,3]ww</div>";
  const data = {
    name: "def",
    fn: () => 1,
    p: { arr: [{ M: "w" }, 2, 3] },
    age: 30,
  };
  assertEquals(
    await tpl.renderFile("./test/index.html", data),
    result,
    result2,
  );
});
