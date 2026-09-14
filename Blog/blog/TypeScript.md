---
title: "TypeScript"
description: "TypeScript 知识点学习笔记"
date: "2026-07-21"
categories:
  - 前端技术
tags:
  - TypeScript
  - 学习笔记
---

# TypeScript

## 什么是[TypeScript](https://www.typescriptlang.org/)？

TypeScript（简称 TS）是微软公司开发的一种基于 JavaScript （简称 JS）语言的编程语言。

它诞生的目的并不是创造一种全新语言，而是增强 JavaScript 的功能，使其更适合多人合作的企业级项目。



TypeScript 可以看成是 JavaScript 的超集（superset），即它继承了后者的全部语法，所有 JavaScript 脚本都可以当作 TypeScript 脚本（但是可能会报错），此外它再增加了一些自己的语法。

TypeScript 对 JavaScript 添加的最主要部分，就是一个独立的类型系统。



说人话就是，

**JavaScript + 类型系统 + 更多功能 = TypeScript**



截止落笔：TypeScript的最新稳定版本为5.5.4，beta版本为5.6

平台为了稳定性考虑，所使用的TypeScript版本为5.3.3

>（此处原为内部系统截图，已移除）

## 为什么我们要用TypeScript？

根据微软的研究表明，TypeScript能识别出大约15%的JavaScript错误，而动态类型的自由经常导致错误，这不仅降低了开发人员的效率，而且由于添加新代码行的开销增加而使开发变得很复杂。

因此，由于缺乏类型和编译时错误检查，JavaScript 对于组织和大型代码库中的服务器端代码来说是一个糟糕的选择。



前面提到的静态类型有很多好处，这也是 TypeScript 想要达到的**目的**。

### 有利于代码的静态分析。

有了静态类型，不必运行代码，就可以确定变量的类型，从而推断代码有没有错误。这就叫做代码的静态分析。

这对于大型项目非常重要，单单在开发阶段运行静态检查，就可以发现很多问题，避免交付有问题的代码，大大降低了线上风险。

### 有利于发现错误。

由于每个值、每个变量、每个运算符都有严格的类型约束，TypeScript 就能轻松发现拼写错误、语义错误和方法调用错误，节省程序员的时间。

```TypeScript
let obj = { message: '' };
console.log(obj.messege); // 报错
```

上面示例中，不小心把`message`拼错了，写成`messege`。TypeScript 就会报错，指出没有定义过这个属性。JavaScript 遇到这种情况是不报错的。

```TypeScript
const a = 0;
const b = true;
const result = a + b; // 报错
```

上面示例是合法的 JavaScript 代码，但是没有意义，不应该将数值`a`与布尔值`b`相加。TypeScript 就会直接报错，提示运算符`+`不能用于数值和布尔值的相加。

```TypeScript
function hello() {
    return 'hello world';
}

hello().find('hello'); // 报错
```

上面示例中，`hello()`返回的是一个字符串，TypeScript 发现字符串没有`find()`方法，所以报错了。如果是 JavaScript，只有到运行阶段才会报错。

### 更好的 IDE 支持，做到语法提示和自动补全。

IDE（集成开发环境，比如 VSCode）一般都会利用类型信息，提供语法提示功能（编辑器自动提示函数用法、参数等）和自动补全功能（只键入一部分的变量名或函数名，编辑器补全后面的部分）。

### 提供了代码文档。

类型信息可以部分替代代码文档，解释应该如何使用这些代码，熟练的开发者往往只看类型，就能大致推断代码的作用。借助类型信息，很多工具能够直接生成文档。

### 有助于代码重构。

修改他人的 JavaScript 代码，往往非常痛苦，项目越大越痛苦，因为不确定修改后是否会影响到其他部分的代码。

类型信息大大减轻了重构的成本。一般来说，只要函数或对象的参数和返回值保持类型不变，就能基本确定，重构后的代码也能正常运行。如果还有配套的单元测试，就完全可以放心重构。越是大型的、多人合作的项目，类型信息能够提供的帮助越大。

综上所述，TypeScript 有助于提高代码质量，保证代码安全，更适合用在大型的企业级项目。这就是为什么大量 JavaScript 项目转成 TypeScript 的原因。



## TypeScript和JavaScript的区别

1. JavaScript是解释型脚本语言，TypeScript是编译型的语言。
2. JavaScript在运行的时候可以改变变量的类型，也就是说在运行的时候才确定变量类型，而TypeScript在声明变量的时候就已经确定了变量的类型。JavaScript是动态弱类型，TypeScript是静态强类型
3. JavaScript可以直接在浏览器中运行，TypeScript由于有一层类型限制，所以需要先编译成JavaScript才能在浏览器中运行。
4. 由于TypeScript有编译和静态类型，所以TypeScript开发者可以围绕这些优点构建类型检查、自动补全、重构工具等一系列工具。

🌰1：

```TypeScript
function addOne(n:number) {
  return n + 1;
}
```

```TypeScript
addOne('hello') // 报错
```

🌰2:

```TypeScript
// 例一
let x = 1;
x = 'hello'; // 报错

// 例二
let y = { foo: 1 };
delete y.foo; // 报错
y.bar = 2; // 报错
```



## 那么代价是什么？

引入了静态类型，能得到以上所说的这么多好处，但是天下没有免费的午餐，那么代价是什么？

### 失去了动态类型的代码灵活性

动态类型具有非常高的灵活性，基于了程序员很大的自由，静态类型亲手摧毁了这一切，它将一切灵活性剥夺殆尽。

### 增加程序员的工作量

弱类型本来基本上是没有类型这一说的，有了类型之后程序员不仅需要编写功能，还需要编写类型声明，还得确保类型正确。这将增加了不少工作时长，有时会显著拖长项目的开发时间。

### 更高的学习成本

类型系统通常比较复杂，要学习的东西更多，要求开发者付出更高的学习成本。

### 引入了独立的编译步骤。

原生的 JavaScript 代码，可以直接在 JavaScript 引擎上运行，也就是浏览器和Node.js。添加类型系统以后，就多出了一个单独的编译步骤，检查类型是否正确，并将 TypeScript 代码转成 JavaScript 代码，这样才能运行。

### 兼容性问题。

TypeScript 依赖 JavaScript 生态，需要用到很多外部模块。但是，过去大部分 JavaScript 项目都没有做 TypeScript 适配，虽然可以自己动手做适配，不过使用时难免还是会有一些兼容性问题。

总的来说，这些缺点使得 TypeScript 不一定适合那些小型的、短期的个人项目。



## TypeScript 的编译

JavaScript 的运行环境（**浏览器和 Node.js**）不认识 TypeScript 代码。所以，TypeScript 项目要想运行，必须先转为 JavaScript 代码，这个代码转换的过程就叫做“编译”（compile）。

TypeScript 官方没有做运行环境，只提供编译器。编译时，会将类型声明和类型相关的代码全部删除，只留下能运行的 JavaScript 代码，并且不会改变 JavaScript 的运行结果。

因此，TypeScript 的类型检查只是编译时的类型检查，而不是运行时的类型检查。一旦代码编译为 JavaScript，运行时就不再检查类型了。



TypeScript 官方提供的编译器叫做 tsc，可以将 TypeScript 脚本编译成 JavaScript 脚本。本机想要编译 TypeScript 代码，必须安装 tsc。

根据约定，TypeScript 脚本文件使用`.ts`后缀名，JavaScript 脚本文件使用`.js`后缀名。tsc 的作用就是把`.ts`脚本转变成`.js`脚本。



tsc 是一个 npm 模块，使用下面的命令安装（必须先安装 npm）。

```Bash
$ npm install -g typescript
```

上面命令是全局安装 tsc，也可以在项目中将 tsc 安装为一个依赖模块。

安装完成后，检查一下是否安装成功。

```Bash
# 或者 tsc --version
$ tsc -v
Version 5.1.6
```

上面命令中，`-v`或`--version`参数可以输出当前安装的 tsc 版本。



截止落笔：上个月，七月二十五号，Node.js已经合并了实验性质的TypeScript原生支持，

根据 PR 的描述，开发者只需配置实验性 flag`--experimental-strip-types`就可以执行 TypeScript 文件。

Node.js 会将 TypeScript 代码自动转译为 JavaScript 代码。在转译过程中，不会执行类型检查，类型会被丢弃 ——Node.js 团队称之为 "type stripping"（类型剥离）。

类型剥离意味着删除所有 `types`，转换 JavaScript 模块中的输入。

[module: add --experimental-strip-types by marco-ippolito · Pull Request #53725 · nodejs/node](https://github.com/nodejs/node/pull/53725)



## 基本类型

JavaScript 语言（注意，不是 TypeScript）将值分成8种类型。

- boolean
- string
- number
- bigint
- symbol
- object
- undefined
- null

TypeScript 继承了 JavaScript 的类型设计，以上8种类型可以看作 TypeScript 的基本类型。

注意，上面所有类型的名称都是小写字母，首字母大写的`Number`、`String`、`Boolean`等在 JavaScript 语言中都是内置对象，而不是类型名称。

另外，undefined 和 null 既可以作为值，也可以作为类型，取决于在哪里使用它们。

这8种基本类型是 TypeScript 类型系统的基础，复杂类型由它们组合而成。

### boolean 类型

`boolean`类型只包含`true`和`false`两个布尔值。

```TypeScript
const x:boolean = true;
const y:boolean = false;
```

上面示例中，变量`x`和`y`就属于 boolean 类型。

### string 类型

`string`类型包含所有字符串。

```TypeScript
const x:string = 'hello';
const y:string = `${x} world`;
```

上面示例中，普通字符串和模板字符串都属于 string 类型。

### number 类型

`number`类型包含所有整数和浮点数。

```TypeScript
const x:number = 123;
const y:number = 3.14;
const z:number = 0xffff;
```

上面示例中，整数、浮点数和非十进制数都属于 number 类型。

### bigint 类型

bigint 类型包含所有的大整数。

```TypeScript
const x:bigint = 123n;
const y:bigint = 0xffffn;
```

上面示例中，变量`x`和`y`就属于 bigint 类型。

bigint 与 number 类型不兼容。

```TypeScript
const x:bigint = 123; // 报错const y:bigint = 3.14; // 报错
```

上面示例中，`bigint`类型赋值为整数和小数，都会报错。

注意，bigint 类型是 ES2020 标准引入的。如果使用这个类型，TypeScript 编译的目标 JavaScript 版本不能低于 ES2020（即编译参数`target`不低于`es2020`）。

### symbol 类型

symbol 类型包含所有的 Symbol 值。

```TypeScript
const x:symbol = Symbol();
```

上面示例中，`Symbol()`函数的返回值就是 symbol 类型。

Symbol 是 ES2015 新引入的一种原始类型的值。它类似于字符串，但是每一个 Symbol 值都是独一无二的，与其他任何值都不相等。

### object 类型

根据 JavaScript 的设计，object 类型包含了所有对象、数组和函数。

```TypeScript
const x:object = { foo: 123 };
const y:object = [1, 2, 3];
const z:object = (n:number) => n + 1;
```

上面示例中，对象、数组、函数都属于 object 类型。

### undefined 类型，null 类型

undefined 和 null 是两种独立类型，它们各自都只有一个值。

undefined 类型只包含一个值`undefined`，表示未定义（即还未给出定义，以后可能会有定义）。

```TypeScript
let x:undefined = undefined;
```

上面示例中，变量`x`就属于 undefined 类型。两个`undefined`里面，第一个是类型，第二个是值。

null 类型也只包含一个值`null`，表示为空（即此处没有值）。

```TypeScript
const x:null = null;
```

上面示例中，变量`x`就属于 null 类型。

注意，如果没有声明类型的变量，被赋值为`undefined`或`null`，在关闭编译设置`noImplicitAny`和`strictNullChecks`时，它们的类型会被推断为`any`。

```TypeScript
// 关闭 noImplicitAny 和 strictNullChecks

let a = undefined;   // any
const b = undefined; // any
let c = null;        // any
const d = null;      // any
```

如果希望避免这种情况，则需要打开编译选项`strictNullChecks`。

```TypeScript
// 打开编译设置 strictNullChecks
let a = undefined;   // undefined
const b = undefined; // undefined
let c = null;        // null
const d = null;      // null
```

上面示例中，打开编译设置`strictNullChecks`以后，赋值为`undefined`的变量会被推断为`undefined`类型，赋值为`null`的变量会被推断为`null`类型。

## any 类型

any 类型表示没有任何限制，该类型的变量可以赋予任意类型的值。

```TypeScript
let x:any;

x = 1; // 正确
x = 'foo'; // 正确
x = true; // 正确
```

上面示例中，变量`x`的类型是`any`，就可以被赋值为任意类型的值。

变量类型一旦设为`any`，TypeScript 实际上会关闭这个变量的类型检查。即使有明显的类型错误，只要句法正确，都不会报错。

```TypeScript
let x:any = 'hello';

x(1) // 不报错
x.foo = 100; // 不报错
```

上面示例中，变量`x`的值是一个字符串，但是把它当作函数调用，或者当作对象读取任意属性，TypeScript 编译时都会不报错。原因就是`x`的类型是`any`，TypeScript 不对其进行类型检查。

由于这个原因，应该尽量避免使用`any`类型，否则就失去了使用 TypeScript 的意义。

实际开发中，`any`类型主要适用以下两个场合。

1. 出于特殊原因，需要关闭某些变量的类型检查，就可以把该变量的类型设为`any`。
2. 为了适配以前老的 JavaScript 项目，让代码快速迁移到 TypeScript，可以把变量类型设为`any`。有些年代很久的大型 JavaScript 项目，尤其是别人的代码，很难为每一行适配正确的类型，这时你为那些类型复杂的变量加上`any`，TypeScript 编译时就不会报错。

总之，TypeScript 认为，只要开发者使用了`any`类型，就表示开发者想要自己来处理这些代码，所以就不对`any`类型进行任何限制，怎么使用都可以。

从集合论的角度看，`any`类型可以看成是所有其他类型的全集，包含了一切可能的类型。TypeScript 将这种类型称为“顶层类型”（top type），意为涵盖了所有下层。

### 类型推断问题

对于开发者没有指定类型、TypeScript 必须自己推断类型的那些变量，如果无法推断出类型，TypeScript 就会认为该变量的类型是`any`。

```TypeScript
function add(x, y) {
  return x + y;
}

add(1, [1, 2, 3]) // 不报错
```

上面示例中，函数`add()`的参数变量`x`和`y`，都没有足够的信息，TypeScript 无法推断出它们的类型，就会认为这两个变量和函数返回值的类型都是`any`。以至于后面就不再对函数`add()`进行类型检查了，怎么用都可以。

这显然是很糟糕的情况，所以对于那些类型不明显的变量，一定要显式声明类型，防止被推断为`any`。



TypeScript 提供了一个编译选项`noImplicitAny`，打开该选项，只要推断出`any`类型就会报错。

这里有一个特殊情况，即使打开了`noImplicitAny`，使用`let`和`var`命令声明变量，但不赋值也不指定类型，是不会报错的。因为用`let` 和`var`是不用赋值的也不用声明类型，`const`命令没有这个问题，因为 JavaScript 语言规定`const`声明变量时，必须同时进行初始化（赋值）。

###  any污染问题

`any`类型除了关闭类型检查，还有一个很大的问题，就是它会“污染”其他变量。它可以赋值给其他任何类型的变量（因为没有类型检查），导致其他变量出错。

```TypeScript
let x:any = 'hello';
let y:number;
y = x; // 不报错
y * 123 // 不报错
y.toFixed() // 不报错
```

上面示例中，变量`x`的类型是`any`，实际的值是一个字符串。变量`y`的类型是`number`，表示这是一个数值变量，但是它被赋值为`x`，这时并不会报错。然后，变量`y`继续进行各种数值运算，TypeScript 也检查不出错误，问题就这样留到运行时才会暴露。

污染其他具有正确类型的变量，把错误留到运行时，这就是不宜使用`any`类型的另一个主要原因。

## unknown 类型

为了解决`any`类型“污染”其他变量的问题，TypeScript 3.0 引入了[`unknown`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)[类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)。它与`any`含义相同，表示类型不确定，可能是任意类型，但是它的使用有一些限制，不像`any`那样自由，可以视为严格版的`any`。

`unknown`类型跟`any`类型的不同之处在于，它不能直接使用。主要有以下几个限制。

首先，`unknown`类型的变量，不能直接赋值给其他类型的变量（除了`any`类型和`unknown`类型）。

```TypeScript
let v:unknown = 123;

let v1:boolean = v; // 报错
let v2:number = v; // 报错
```

上面示例中，变量`v`是`unknown`类型，赋值给`any`和`unknown`以外类型的变量都会报错，这就避免了污染问题，从而克服了`any`类型的一大缺点。

其次，不能直接调用`unknown`类型变量的方法和属性。

```TypeScript
let v1:unknown = { foo: 123 };
v1.foo  // 报错
let v2:unknown = 'hello';
v2.trim() // 报错
let v3:unknown = (n = 0) => n + 1;
v3() // 报错
```

上面示例中，直接调用`unknown`类型变量的属性和方法，或者直接当作函数执行，都会报错。

再次，`unknown`类型变量能够进行的运算是有限的，只能进行比较运算（运算符`==`、`===`、`!=`、`!==`、`||`、`&&`、`?`）、取反运算（运算符`!`）、`typeof`运算符和`instanceof`运算符这几种，其他运算都会报错。

```TypeScript
let a:unknown = 1;
a + 1 // 报错
a === 1 // 正确
```

上面示例中，`unknown`类型的变量`a`进行加法运算会报错，因为这是不允许的运算。但是，进行比较运算就是可以的。

那么，怎么才能使用`unknown`类型变量呢？

答案是只有经过“类型缩小”，`unknown`类型变量才可以使用。所谓“类型缩小”，就是缩小`unknown`变量的类型范围，确保不会出错。

```TypeScript
let a:unknown = 1;

if (typeof a === 'number') {let r = a + 10; // 正确
}
```

上面示例中，`unknown`类型的变量`a`经过`typeof`运算以后，能够确定实际类型是`number`，就能用于加法运算了。这就是“类型缩小”，即将一个不确定的类型缩小为更明确的类型。

下面是另一个例子。

```TypeScript
let s:unknown = 'hello';

if (typeof s === 'string') {
  s.length; // 正确
}
```

上面示例中，确定变量`s`的类型为字符串以后，才能调用它的`length`属性。

这样设计的目的是，只有明确`unknown`变量的实际类型，才允许使用它，防止像`any`那样可以随意乱用，“污染”其他变量。类型缩小以后再使用，就不会报错。

总之，`unknown`可以看作是更安全的`any`。一般来说，凡是需要设为`any`类型的地方，通常都应该优先考虑设为`unknown`类型。

在集合论上，`unknown`也可以视为所有其他类型（除了`any`）的全集，所以它和`any`一样，也属于 TypeScript 的顶层类型。

## never 类型

为了保持与集合论的对应关系，以及类型运算的完整性，TypeScript 还引入了“空类型”的概念，即该类型为空，不包含任何值。

由于不存在任何属于“空类型”的值，所以该类型被称为`never`，即不可能有这样的值。

```TypeScript
let x:never;
```

上面示例中，变量`x`的类型是`never`，就不可能赋给它任何值，否则都会报错。

`never`类型的使用场景，主要是在一些类型运算之中，保证类型运算的完整性，详见后面章节。另外，不可能返回值的函数，返回值的类型就可以写成`never`.

如果一个变量可能有多种类型（即联合类型），通常需要使用分支处理每一种类型。这时，处理所有可能的类型之后，剩余的情况就属于`never`类型。

```TypeScript
function fn(x:string|number) {if (typeof x === 'string') {// ...
  } else if (typeof x === 'number') {// ...
  } else {
    x; // never 类型
  }
}
```

上面示例中，参数变量`x`可能是字符串，也可能是数值，判断了这两种情况后，剩下的最后那个`else`分支里面，`x`就是`never`类型了。

`never`类型的一个重要特点是，可以赋值给任意其他类型。

```TypeScript
function f():never {throw new Error('Error');
}

let v1:number = f(); // 不报错
let v2:string = f(); // 不报错
let v3:boolean = f(); // 不报错
```

上面示例中，函数`f()`会抛出错误，所以返回值类型可以写成`never`，即不可能返回任何值。各种其他类型的变量都可以赋值为`f()`的运行结果（`never`类型）。

为什么`never`类型可以赋值给任意其他类型呢？这也跟集合论有关，空集是任何集合的子集。TypeScript 就相应规定，任何类型都包含了`never`类型。因此，`never`类型是任何其他类型所共有的，TypeScript 把这种情况称为“底层类型”（bottom type）。

总之，TypeScript 有两个“顶层类型”（`any`和`unknown`），但是“底层类型”只有`never`唯一一个。

## 联合类型

联合类型（union types）指的是多个类型组成的一个新类型，使用符号`|`表示。

联合类型`A|B`表示，任何一个类型只要属于`A`或`B`，就属于联合类型`A|B`。

```TypeScript
let x:string|number;
x = 123; // 正确
x = 'abc'; // 正确
```

上面示例中，变量`x`就是联合类型`string|number`，表示它的值既可以是字符串，也可以是数值。

联合类型可以与值类型相结合，表示一个变量的值有若干种可能。

```TypeScript
let setting:true|false;

let gender:'male'|'female';

let rainbowColor:'赤'|'橙'|'黄'|'绿'|'青'|'蓝'|'紫';
```

上面的示例都是由值类型组成的联合类型，非常清晰地表达了变量的取值范围。其中，`true|false`其实就是布尔类型`boolean`。

前面提到，打开编译选项`strictNullChecks`后，其他类型的变量不能赋值为`undefined`或`null`。这时，如果某个变量确实可能包含空值，就可以采用联合类型的写法。

```TypeScript
let name:string|null;
name = 'John';
name = null;
```

上面示例中，变量`name`的值可以是字符串，也可以是`null`。

联合类型的第一个成员前面，也可以加上竖杠`|`，这样便于多行书写。

```TypeScript
let x:
  | 'one'
  | 'two'
  | 'three'
  | 'four';
```

上面示例中，联合类型的第一个成员`one`前面，加上了竖杠。

如果一个变量有多种类型，读取该变量时，往往需要进行“类型缩小”（type narrowing），区分该值到底属于哪一种类型，然后再进一步处理。

```TypeScript
function printId(id:number|string) {console.log(id.toUpperCase()); // 报错
}
```

上面示例中，参数变量`id`可能是数值，也可能是字符串，这时直接对这个变量调用`toUpperCase()`方法会报错，因为这个方法只存在于字符串，不存在于数值。

解决方法就是对参数`id`做一下类型缩小，确定它的类型以后再进行处理。

```TypeScript
function printId(id:number|string) {if (typeof id === 'string') {console.log(id.toUpperCase());
  } else {console.log(id);
  }
}
```

上面示例中，函数体内部会判断一下变量`id`的类型，如果是字符串，就对其执行`toUpperCase()`方法。

### 类型缩小

“类型缩小”是 TypeScript 处理联合类型的标准方法，凡是遇到可能为多种类型的场合，都需要先缩小类型，再进行处理。实际上，联合类型本身可以看成是一种“类型放大”（type widening），处理时就需要“类型缩小”（type narrowing）。

下面是“类型缩小”的另一个例子。

```TypeScript
function getPort(scheme: 'http'|'https') {switch (scheme) {case 'http':return 80;case 'https':return 443;
  }
}
```

上面示例中，函数体内部对参数变量`scheme`进行类型缩小，根据不同的值类型，返回不同的结果。



## 交叉类型

交叉类型（intersection types）指的多个类型组成的一个新类型，使用符号`&`表示。

交叉类型`A&B`表示，任何一个类型必须同时属于`A`和`B`，才属于交叉类型`A&B`，即交叉类型同时满足`A`和`B`的特征。

```TypeScript
let x:number&string;
```

上面示例中，变量`x`同时是数值和字符串，这当然是不可能的，所以 TypeScript 会认为`x`的类型实际是`never`。

交叉类型的主要用途是表示对象的合成。

```TypeScript
let obj:
  { foo: string } &
  { bar: string };
  
obj = {
    foo: 'hello',
    bar: 'world'
};
```

上面示例中，变量`obj`同时具有属性`foo`和属性`bar`。

交叉类型常常用来为对象类型添加新属性。

```TypeScript
type A = { foo: number };

type B = A & { bar: number };
```

上面示例中，类型`B`是一个交叉类型，用来在`A`的基础上增加了属性`bar`。



## type 命令

`type`命令用来定义一个类型的别名。

```TypeScript
type Age = number;

let age:Age = 55;
```

上面示例中，`type`命令为`number`类型定义了一个别名`Age`。这样就能像使用`number`一样，使用`Age`作为类型。

别名可以让类型的名字变得更有意义，也能增加代码的可读性，还可以使复杂类型用起来更方便，便于以后修改变量的类型。

别名不允许重名。

```TypeScript
type Color = 'red';
type Color = 'blue'; // 报错
```

上面示例中，同一个别名`Color`声明了两次，就报错了。

别名的作用域是块级作用域。这意味着，代码块内部定义的别名，影响不到外部。

```TypeScript
type Color = 'red';

if (Math.random() < 0.5) {type Color = 'blue';
}
```

上面示例中，`if`代码块内部的类型别名`Color`，跟外部的`Color`是不一样的。

别名支持使用表达式，也可以在定义一个别名时，使用另一个别名，即别名允许嵌套。

```TypeScript
type World = "world";
type Greeting = `hello ${World}`;
```

上面示例中，别名`Greeting`使用了模板字符串，读取另一个别名`World`。

`type`命令属于类型相关的代码，在最后执行打包编译成 JavaScript 的时候，会被全部删除。



## 数组 类型

JavaScript 数组在 TypeScript 里面分成两种类型，分别是数组（array）和元组（tuple）。

### Array 数组

TypeScript 数组有一个根本特征：所有成员的类型必须相同，但是成员数量是不确定的，可以是无限数量的成员，也可以是零成员。

数组的类型有两种写法。第一种写法是在数组成员的类型后面，加上一对方括号。

```TypeScript
let arr:number= [1, 2, 3];
```

上面示例中，数组`arr`的类型是`number[]`，其中`number`表示数组成员类型是`number`。

如果数组成员的类型比较复杂，可以写在圆括号里面。

```TypeScript
let arr:(number|string)[];
```

上面示例中，数组`arr`的成员类型是`number|string`。

这个例子里面的圆括号是**必须的**，否则因为竖杠`|`的优先级低于`[]`，TypeScript 会把`number|string[]`理解成`number`和`string[]`的联合类型。

如果数组成员可以是任意类型，写成`any[]`。当然，这种写法是应该避免的。

```TypeScript
let arr:any[];
```

数组类型的第二种写法是使用 TypeScript 内置的 Array 接口。

```TypeScript
let arr:Array<number= [1, 2, 3];
```

上面示例中，数组`arr`的类型是`Array<number>`，其中`number`表示成员类型是`number`。

这种写法对于成员类型比较复杂的数组，代码可读性会稍微好一些。

```TypeScript
let arr:Array<number|string>;
```

这种写法本质上属于泛型，这里只要知道怎么写就可以了。很少用到。

数组类型声明了以后，成员数量是不限制的，任意数量的成员都可以，也可以是空数组。

```TypeScript
let arr:number[];
arr = [];
arr = [1];
arr = [1, 2];
arr = [1, 2, 3];
```

上面示例中，数组`arr`无论有多少个成员，都是正确的。

这种规定的隐藏含义就是，数组的成员是可以动态变化的。

```TypeScript
let arr:number= [1, 2, 3];
arr[3] = 4;
arr.length = 2;
arr // [1, 2]
```

上面示例中，数组增加成员或减少成员，都是可以的。

正是由于成员数量可以动态变化，所以 TypeScript 不会对数组边界进行检查，越界访问数组并不会报错。

```TypeScript
let arr:number= [1, 2, 3];
let foo = arr[3]; // 正确
```

上面示例中，变量`foo`的值是一个不存在的数组成员，TypeScript 并不会报错。

TypeScript 允许使用方括号读取数组成员的类型。

```TypeScript
type Names = string[];
type Name = Names[0]; // string
```

上面示例中，类型`Names`是字符串数组，那么`Names[0]`返回的类型就是`string`。

由于数组成员的索引类型都是`number`，所以读取成员类型也可以写成下面这样。

```TypeScript
type Names = string[];
type Name = Names[number]; // string
```

上面示例中，`Names[number]`表示数组`Names`所有数值索引的成员类型，所以返回`string`。

#### 数组的类型推断 

如果数组变量没有声明类型，TypeScript 就会推断数组成员的类型。这时，推断行为会因为值的不同，而有所不同。

如果变量的初始值是空数组，那么 TypeScript 会推断数组类型是`any[]`。

```TypeScript
// 推断为 any[]
const arr = [];
```

后面，为这个数组赋值时，TypeScript 会自动更新类型推断。

```TypeScript
const arr = [];
arr // 推断为 any[]
arr.push(123);
arr // 推断类型为 number[]
arr.push('abc');
arr // 推断类型为 (string|number)[]
```

上面示例中，数组变量`arr`的初始值是空数组，然后随着新成员的加入，TypeScript 会自动修改推断的数组类型。

但是，类型推断的自动更新只发生初始值为空数组的情况。如果初始值不是空数组，类型推断就不会更新。

```TypeScript
// 推断类型为 number[]
const arr = [123];
arr.push('abc'); // 报错
```

上面示例中，数组变量`arr`的初始值是`[123]`，TypeScript 就推断成员类型为`number`。新成员如果不是这个类型，TypeScript 就会报错，而不会更新类型推断。

### Tuple 元组

元组（tuple）是 TypeScript 特有的数据类型，JavaScript 没有单独区分这种类型。它表示成员类型可以自由设置的数组，即数组的各个成员的类型可以不同。

由于成员的类型可以不一样，所以元组必须明确声明每个成员的类型。

```TypeScript
const s:[string, string, boolean] = ['a', 'b', true];
```

上面示例中，元组`s`的前两个成员的类型是`string`，最后一个成员的类型是`boolean`。

元组类型的写法，与上一章的数组有一个重大差异。数组的成员类型写在方括号外面（`number[]`），元组的成员类型是写在方括号里面（`[number]`）。TypeScript 的区分方法就是，成员类型写在方括号里面的就是元组，写在外面的就是数组。

```TypeScript
// 数组
let a:number= [1];

// 元组
let t:[number] = [1];
```

上面示例中，变量`a`和`t`的值都是`[1]`，但是它们的类型是不一样的。`a`是一个数组，成员类型`number`写在方括号外面；`t`是一个元组，成员类型`number`写在方括号里面。

使用元组时，必须明确给出类型声明（上例的`[number]`），不能省略，否则 TypeScript 会把一个值自动推断为数组。

```TypeScript
// a 的类型被推断为 (number | boolean)[]
let a = [1, true];
```

上面示例中，变量`a`的值其实是一个元组，但是 TypeScript 会将其推断为一个联合类型的数组，即`a`的类型为`(number | boolean)[]`。所以，元组必须显式给出类型声明。

元组成员的类型可以添加问号后缀（`?`），表示该成员是可选的。

```TypeScript
let a:[number, number?] = [1];
```

上面示例中，元组`a`的第二个成员是可选的，可以省略。

注意，问号只能用于元组的尾部成员，也就是说，所有可选成员必须在必选成员之后。

```TypeScript
type myTuple = [number,number,number?,string?];
```

上面示例中，元组`myTuple`的最后两个成员是可选的。也就是说，它的成员数量可能有两个、三个和四个。

由于需要声明每个成员的类型，所以大多数情况下，元组的成员数量是有限的，从类型声明就可以明确知道，元组包含多少个成员，越界的成员会报错。

```TypeScript
let x:[string, string] = ['a', 'b'];
x[2] = 'c'; // 报错
```

上面示例中，变量`x`是一个只有两个成员的元组，如果对第三个成员赋值就报错了。

但是，使用扩展运算符（`...`），可以表示不限成员数量的元组。

```TypeScript
type NamedNums = [string,
  ...number[]
];

const a:NamedNums = ['A', 1, 2];
const b:NamedNums = ['B', 1, 2, 3];
```

上面示例中，元组类型`NamedNums`的第一个成员是字符串，后面的成员使用扩展运算符来展开一个数组，从而实现了不定数量的成员。

**一旦扩展运算符使得元组的成员数量无法推断，TypeScript 内部就会把该元组当成数组处理。**

扩展运算符（`...`）用在元组的任意位置都可以，它的后面只能是一个数组或元组。

```TypeScript
type t1 = [string, number, ...boolean[]];
type t2 = [string, ...boolean[], number];
type t3 = [...boolean[], string, number];
```

上面示例中，扩展运算符分别在元组的尾部、中部和头部，`...`的后面是一个数组`boolean[]`。

如果不确定元组成员的类型和数量，可以写成下面这样。

```TypeScript
type Tuple = [...any[]];
```

上面示例中，元组`Tuple`可以放置任意数量和类型的成员。但是这样写，也就失去了使用元组和 TypeScript 的意义。

元组的成员可以添加成员名，这个成员名是说明性的，可以任意取名，没有实际作用。

```TypeScript
type Color = [red: number,green: number,blue: number];

const c:Color = [255, 255, 255];
```

上面示例中，类型`Color`是一个元组，它有三个成员。每个成员都有一个名字，写在具体类型的前面，使用冒号分隔。这几个名字可以随便取，没有实际作用，只是用来说明每个成员的含义。

元组可以通过方括号，读取成员类型。

```TypeScript
type Tuple = [string, number];
type Age = Tuple[1]; // number
```

上面示例中，`Tuple[1]`返回1号位置的成员类型。

由于元组的成员都是数值索引，即索引类型都是`number`，所以可以像下面这样读取。

```TypeScript
type Tuple = [string, number, Date];
type TupleEl = Tuple[number];  // string|number|Date
```

上面示例中，`Tuple[number]`表示元组`Tuple`的所有数值索引的成员类型，所以返回`string|number|Date`，即这个类型是三种值的联合类型。



## interface 接口

interface 是对象的模板，可以看作是一种类型约定，中文译为“接口”。使用了某个模板的对象，就拥有了指定的类型结构。

```TypeScript
interface Person {
    firstName: string;
    lastName: string;
    age: number;
}
```

上面示例中，定义了一个接口`Person`，它指定一个对象模板，拥有三个属性`firstName`、`lastName`和`age`。任何实现这个接口的对象，都必须部署这三个属性，并且必须符合规定的类型。

实现该接口很简单，只要指定它作为对象的类型即可。

```TypeScript
const p:Person = {
    firstName: 'John',
    lastName: 'Smith',
    age: 25
};
```

上面示例中，变量`p`的类型就是接口`Person`，所以必须符合`Person`指定的结构。

方括号运算符可以取出 interface 某个属性的类型。

```TypeScript
interface Foo {a: string;}

type A = Foo['a']; // string
```

上面示例中，`Foo['a']`返回属性`a`的类型，所以类型`A`就是`string`。

interface 可以表示对象的各种语法，它的成员有5种形式。

- 对象属性
- 对象的属性索引
- 对象方法
- 函数
- 构造函数

1. 对象属性

```TypeScript
interface Point {
    x: number;
    y: number;
}
```

上面示例中，`x`和`y`都是对象的属性，分别使用冒号指定每个属性的类型。

属性之间使用分号或逗号分隔，最后一个属性结尾的分号或逗号可以省略。

如果属性是可选的，就在属性名后面加一个问号。

```TypeScript
interface Foo {
  x?: string;
}
```

如果属性是只读的，需要加上`readonly`修饰符。

```TypeScript
interface A {readonly a: string;}
```

1. 对象的属性索引

```TypeScript
interface A {
  [prop: string]: number;
}
```

上面示例中，`[prop: string]`就是属性的字符串索引，表示属性名只要是字符串，都符合类型要求。

属性索引共有`string`、`number`和`symbol`三种类型。

一个接口中，最多只能定义一个字符串索引。字符串索引会约束该类型中所有名字为字符串的属性。

```TypeScript
interface MyObj {
    [prop: string]: number;
    a: boolean;      // 编译错误
}
```

上面示例中，属性索引指定所有名称为字符串的属性，它们的属性值必须是数值（`number`）。属性`a`的值为布尔值就报错了。

属性的数值索引，其实是指定数组的类型。

```TypeScript
interface A {
  [prop: number]: string;
}

const obj:A = ['a', 'b', 'c'];
```

上面示例中，`[prop: number]`表示属性名的类型是数值，所以可以用数组对变量`obj`赋值。

同样的，一个接口中最多只能定义一个数值索引。数值索引会约束所有名称为数值的属性。

如果一个 interface 同时定义了字符串索引和数值索引，那么数值索引必须服从于字符串索引。因为在 JavaScript 中，数值属性名最终是自动转换成字符串属性名。

```TypeScript
interface A {
  [prop: string]: number;
  [prop: number]: string; // 报错
}

interface B {
  [prop: string]: number;
  [prop: number]: number; // 正确
}
```

上面示例中，数值索引的属性值类型与字符串索引不一致，就会报错。数值索引必须兼容字符串索引的类型声明。

1. 对象的方法

对象的方法共有三种写法。

```TypeScript
// 写法一
interface A {
    f(x: boolean): string;
}

// 写法二
interface B {
    f: (x: boolean) => string;
}

// 写法三
interface C {
    f: { 
        (x: boolean): string 
    };
}
```

属性名可以采用表达式，所以下面的写法也是可以的。

```TypeScript
const f = 'f';

interface A {
  [f](x: boolean): string;
}
```

类型方法可以重载。

```TypeScript
interface A {
    f(): number;
    f(x: boolean): boolean;
    f(x: string, y: string): string;
}
```

interface 里面的函数重载，不需要给出实现。但是，由于对象内部定义方法时，无法使用函数重载的语法，所以需要额外在对象外部给出函数方法的实现。

```TypeScript
interface A {
  f(): number;
  f(x: boolean): boolean;
  f(x: string, y: string): string;
}

function MyFunc(): number;
function MyFunc(x: boolean): boolean;
function MyFunc(x: string, y: string): string;
function MyFunc(x?:boolean|string, y?:string):number|boolean|string {
  if (x === undefined && y === undefined) return 1;
  if (typeof x === 'boolean' && y === undefined) return true;
  if (typeof x === 'string' && typeof y === 'string') return 'hello';
  throw new Error('wrong parameters');  
}

const a:A = {
  f: MyFunc
}
```

上面示例中，接口`A`的方法`f()`有函数重载，需要额外定义一个函数`MyFunc()`实现这个重载，然后部署接口`A`的对象`a`的属性`f`等于函数`MyFunc()`就可以了。

1. 函数

interface 也可以用来声明独立的函数。

```TypeScript
interface Add {
  (x:number, y:number): number;
}

const myAdd:Add = (x,y) => x + y;
```

上面示例中，接口`Add`声明了一个函数类型。

1. 构造函数

interface 内部可以使用`new`关键字，表示构造函数。

```TypeScript
interface ErrorConstructor {
     new (message?: string): Error;
}
```

上面示例中，接口`ErrorConstructor`内部有`new`命令，表示它是一个构造函数。

## type和interface的区别

`interface`命令与`type`命令作用类似，都可以表示对象类型。

很多对象类型既可以用 interface 表示，也可以用 type 表示。而且，两者往往可以换用，几乎所有的 interface 命令都可以改写为 type 命令。

```TypeScript
type Country = {
  name: string;
  capital: string;
}

interface Country {
  name: string;
  capital: string;
}
```

上面示例是`type`命令和`interface`命令，分别定义同一个类型。

`class`命令也有类似作用，通过定义一个类，同时定义一个对象类型。但是，它会创造一个值，编译后依然存在。如果只是单纯想要一个类型，应该使用`type`或`interface`。

interface 与 type 的区别有下面几点。

### `type`能够表示非对象类型，而`interface`只能表示对象类型（包括数组、函数等）。

### `interface`可以继承其他类型，`type`不支持继承。

继承的主要作用是添加属性，`type`定义的对象类型如果想要添加属性，只能使用`&`运算符，重新定义一个类型。

```TypeScript
type Animal = {
    name: string
}

type Bear = Animal & {
    honey: boolean
}
```

上面示例中，类型`Bear`在`Animal`的基础上添加了一个属性`honey`。

上例的`&`运算符，表示同时具备两个类型的特征，因此可以起到两个对象类型合并的作用。

作为比较，`interface`添加属性，采用的是继承的写法。

```TypeScript
interface Animal {
    name: string
}

interface Bear extends Animal {
    honey: boolean
}
```

继承时，type 和 interface 是可以换用的。interface 可以继承 type。

```TypeScript
type Foo = { x: number; };

interface Bar extends Foo {y: number;
}
```

type 也可以继承 interface。

```TypeScript
interface Foo {
    x: number;
}

type Bar = Foo & { y: number; };
```

### 同名`interface`会自动合并，同名`type`则会报错。也就是说，TypeScript 不允许使用`type`多次定义同一个类型。

```TypeScript
type A = { foo:number }; // 报错
type A = { bar:number }; // 报错
```

上面示例中，`type`两次定义了类型`A`，导致两行都会报错。

作为比较，`interface`则会自动合并。

```TypeScript
interface A { foo:number };
interface A { bar:number };

const obj:A = {
    foo: 1,
    bar: 1
};
```

上面示例中，`interface`把类型`A`的两个定义合并在一起。

这表明，interface  是开放的，可以添加属性，type 是封闭的，不能添加属性，只能定义新的 type。

### `interface`不能包含属性映射（mapping），`type`可以

```TypeScript
interface Point {
    x: number;
    y: number;
}

// 正确
type PointCopy1 = {
  [Key in keyof Point]: Point[Key];
};

// 报错
interface PointCopy2 {
  [Key in keyof Point]: Point[Key];
};
```

### `this`关键字只能用于`interface`。

```TypeScript
// 正确
interface Foo {
    add(num:number): this;
};

// 报错
type Foo = {
    add(num:number): this;
};
```

上面示例中，type 命令声明的方法`add()`，返回`this`就报错了。interface 命令没有这个问题。

### type 可以扩展原始数据类型，interface 不行。

```TypeScript
// 正确
type MyStr = string & {
    type: 'new'
};

// 报错
interface MyStr extends string {
    type: 'new'
}
```

上面示例中，type 可以扩展原始数据类型 string，interface 就不行。

### `interface`无法表达某些复杂类型（比如交叉类型和联合类型），但是`type`可以。

```TypeScript
type A = { /* ... */ };
type B = { /* ... */ };

type AorB = A | B;
type AorBwithName = AorB & {
    name: string
};
```

上面示例中，类型`AorB`是一个联合类型，`AorBwithName`则是为`AorB`添加一个属性。这两种运算，`interface`都没法表达。

综上所述，如果有复杂的类型运算，那么没有其他选择只能使用`type`；

一般情况下，`interface`灵活性比较高，便于扩充类型或自动合并，建议优先使用。

## 注释指令

TypeScript 接受一些注释指令。

所谓“注释指令”，指的是采用 JS 双斜杠注释的形式，向编译器发出的**命令**。

### `// @ts-nocheck`

`// @ts-nocheck`告诉编译器不对当前脚本进行类型检查，可以用于 TypeScript 脚本，也可以用于 JavaScript 脚本。

```TypeScript
// @ts-nocheck
const element = document.getElementById(123);
```

上面示例中，`document.getElementById(123)`存在类型错误，但是编译器不对该脚本进行类型检查，所以不会报错。

### `// @ts-check`

如果一个 JavaScript 脚本顶部添加了`// @ts-check`，那么编译器将对该脚本进行类型检查，不论是否启用了`checkJs`编译选项。

```TypeScript
// @ts-checklet 
isChecked = true;

console.log(isChceked); // 报错
```

上面示例是一个 JavaScript 脚本，`// @ts-check`告诉 TypeScript 编译器对其进行类型检查，所以最后一行会报错，提示拼写错误。

### `// @ts-ignore`

`// @ts-ignore`告诉编译器不对下一行代码进行类型检查，可以用于 TypeScript 脚本，也可以用于 JavaScript 脚本。

```TypeScript
let x:number;
x = 0;

// @ts-ignore
x = false; // 不报错
```

上面示例中，最后一行是类型错误，变量`x`的类型是`number`，不能等于布尔值。但是因为前面加上了`// @ts-ignore`，编译器会跳过这一行的类型检查，所以不会报错。

### `// @ts-expect-error`

`// @ts-expect-error`主要用在测试用例，当下一行有类型错误时，它会压制 TypeScript 的报错信息（即不显示报错信息），把错误留给代码自己处理。

```TypeScript
function doStuff(abc: string, xyz: string) {
    assert(typeof abc === "string");
    assert(typeof xyz === "string");
    // do some stuff
}

expect(() => {
    // @ts-expect-error
    doStuff(123, 456);
}).toThrow();
```

上面示例是一个测试用例，倒数第二行的`doStuff(123, 456)`的参数类型与定义不一致，TypeScript 引擎会报错。但是，测试用例本身测试的就是这个错误，已经有专门的处理代码，所以这里可以使用`// @ts-expect-error`，不显示引擎的报错信息。

如果下一行没有类型错误，`// @ts-expect-error`则会显示一行提示。

```Plain Text
// @ts-expect-errorconsole.log(1 + 1);
// 输出 Unused '@ts-expect-error' directive.
```

上面示例中，第二行是正确代码，这时系统会给出一个提示，表示`@ts-expect-error`没有用到。

### JSDoc

TypeScript 直接处理 JS 文件时，如果无法推断出类型，会使用 JS 脚本里面的 JSDoc 注释。

使用 JSDoc 时，有两个基本要求。

1. JSDoc 注释必须以`/**`开始，其中星号（`*`）的数量必须为两个。若使用其他形式的多行注释，则 JSDoc 会忽略该条注释。
2. JSDoc 注释必须与它描述的代码处于相邻的位置，并且注释在上，代码在下。

下面是 JSDoc 的一个简单例子。

```TypeScript
/**
 * @param {string} somebody
 */function sayHello(somebody) {console.log('Hello 'somebody);
}
```

上面示例中，注释里面的`@param`是一个 JSDoc 声明，表示下面的函数`sayHello()`的参数`somebody`类型为`string`。

TypeScript 编译器支持大部分的 JSDoc 声明，下面介绍其中的一些。

#### @typedef

`@typedef`命令创建自定义类型，等同于 TypeScript 里面的类型别名。

```TypeScript
/**
 * @typedef {(number | string)} NumberLike
 */
```

上面示例中，定义了一个名为`NumberLike`的新类型，它是由`number`和`string`构成的联合类型，等同于 TypeScript 的如下语句。

```TypeScript
type NumberLike = string | number;
```

#### @type

`@type`命令定义变量的类型。

```TypeScript
/**
 * @type {string}
 */let a;
```

上面示例中，`@type`定义了变量`a`的类型为`string`。

在`@type`命令中可以使用由`@typedef`命令创建的类型。

```TypeScript
/**
 * @typedef {(number | string)} NumberLike
 *//**
 * @type {NumberLike}
 */let a = 0;
```

在`@type`命令中允许使用 TypeScript 类型及其语法。

```TypeScript
/**@type {true | false} */let a;

/** @type {number[]} */let b;

/** @type {Array<number>} */let c;

/** @type {{ readonly x: number, y?: string }} */let d;

/** @type {(s: string, b: boolean) => number} */let e;
```

#### @param

`@param`命令用于定义函数参数的类型。

```TypeScript
/**
 * @param {string}  x
 */function foo(x) {}
```

如果是可选参数，需要将参数名放在方括号`[]`里面。

```TypeScript
/**
 * @param {string}  [x]
 */function foo(x) {}
```

方括号里面，还可以指定参数默认值。

```TypeScript
/**
 * @param {string} [x="bar"]
 */function foo(x) {}
```

上面示例中，参数`x`的默认值是字符串`bar`。

#### @return，@returns

`@return`和`@returns`命令的作用相同，指定函数返回值的类型。

```TypeScript
/**
 * @return {boolean}
 */function foo() {return true;
}

/**
 * @returns {number}
 */function bar() {return 0;
}
```

#### @extends 和类型修饰符

`@extends`命令用于定义继承的基类。

```TypeScript
/**
 * @extends {Base}
 */class Derived extends Base {
}
```

`@public`、`@protected`、`@private`分别指定类的公开成员、保护成员和私有成员。

`@readonly`指定只读成员。

```TypeScript
class Base {/**
   * @public
   * @readonly
   */
  x = 0;
/**
   *  @protected
   */
  y = 0;
}
```