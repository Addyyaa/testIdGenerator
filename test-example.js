"use strict";
/**
 * 扩展测试示例文件
 *
 * 使用方法：
 * 1. 在扩展开发宿主窗口中打开此文件
 * 2. 测试各种场景
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicHTML = BasicHTML;
exports.SelfClosingTags = SelfClosingTags;
exports.ReactComponents = ReactComponents;
exports.ExistingTestId = ExistingTestId;
exports.NestedTags = NestedTags;
exports.TagsWithAttributes = TagsWithAttributes;
exports.FragmentExample = FragmentExample;
exports.ConditionalRendering = ConditionalRendering;
const react_1 = __importDefault(require("react"));
// 测试用例 1: 基本 HTML 标签
function BasicHTML() {
    return (<div>
      <h1>标题</h1>
      <p>段落文字</p>
      <button>按钮</button>
      <a href="#">链接</a>
    </div>);
}
// 测试用例 2: 自闭合标签
function SelfClosingTags() {
    return (<div>
      <img src="image.jpg" alt="图片"/>
      <input type="text" placeholder="输入框"/>
      <br />
      <hr />
    </div>);
}
// 测试用例 3: React 组件
function ReactComponents() {
    return (<div>
      <Button>React 按钮</Button>
      <CustomInput placeholder="自定义输入框"/>
      <MyComponent prop1="value1" prop2={123}/>
    </div>);
}
// 测试用例 4: 已有 Test ID 的标签
function ExistingTestId() {
    return (<div>
      <button data-test-id="existing-button">已有 ID 的按钮</button>
      <input data-test-id="existing-input" type="text"/>
    </div>);
}
// 测试用例 5: 嵌套标签
function NestedTags() {
    return (<div>
      <header>
        <nav>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
          </ul>
        </nav>
      </header>
      <main>
        <article>
          <h2>文章标题</h2>
          <p>文章内容</p>
        </article>
      </main>
    </div>);
}
// 测试用例 6: 带属性的标签
function TagsWithAttributes() {
    return (<div className="container" id="main">
      <button onClick={() => console.log('clicked')} disabled={false} className="btn-primary">
        带多个属性的按钮
      </button>
      <input type="email" name="email" placeholder="输入邮箱" required/>
    </div>);
}
// 测试用例 7: Fragment
function FragmentExample() {
    return (<>
      <div>Fragment 中的内容 1</div>
      <div>Fragment 中的内容 2</div>
    </>);
}
// 测试用例 8: 条件渲染
function ConditionalRendering() {
    const showButton = true;
    return (<div>
      {showButton && <button>条件按钮</button>}
      {!showButton && <p>不显示按钮</p>}
    </div>);
}
//# sourceMappingURL=test-example.js.map