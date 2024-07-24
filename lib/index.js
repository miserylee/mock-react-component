import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneElement, forwardRef, isValidElement, useEffect, useImperativeHandle, useRef, } from 'react';
import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';
const propsCollection = new WeakMap();
const placeholderDiv = document.createElement('div');
function format(item) {
    /**
     * @NOTE: 限制 prettyFormat 的遍历层级，避免复杂对象在序列化时可能内存溢出的问题
     * 同时将 prettyFormat 提供的插件都应用上，针对特定对象有更友好的序列化结果
     */
    return prettyFormat(item, {
        min: true,
        maxDepth: 3,
        plugins: Object.values(prettyFormatPlugins),
    });
}
function SnapshotRenderer({ _testId, ...props }) {
    const elementRef = useRef(placeholderDiv);
    useEffect(() => {
        propsCollection.set(elementRef.current, props);
    }, [props]);
    const propsSnapshot = [];
    Object.entries(props).forEach(([prop, value]) => {
        if (Array.isArray(value)) {
            if (prop === 'children') {
                value = value.flat();
            }
            propsSnapshot.push([
                prop,
                value.map((item, key) => isValidElement(item) ? cloneElement(item, { key }) : format(item)),
            ]);
        }
        else {
            propsSnapshot.push([prop, isValidElement(value) ? value : format(value)]);
        }
    });
    return (_jsx("div", { "data-testid": _testId, ref: elementRef, children: propsSnapshot.map(([prop, value]) => {
            if (typeof value === 'string') {
                return (_jsx("div", { "data-testid": `${_testId}_prop_${prop}`, 
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML: { __html: value } }, prop));
            }
            return (_jsx("div", { "data-testid": `${_testId}_prop_${prop}`, children: value }, prop));
        }) }));
}
/**
 * 创建一个指定 testid 的虚拟组件
 * 这个虚拟组件会将传入的 props 进行一定的序列化，以能够通过 snapshot 表现出来
 * @param testId
 * @param mockRefFactory
 */
export const mockComponent = (testId, mockRefFactory) => {
    const mock = forwardRef((props, ref) => {
        useImperativeHandle(ref, () => {
            return mockRefFactory === null || mockRefFactory === void 0 ? void 0 : mockRefFactory();
        }, []);
        return _jsx(SnapshotRenderer, { ...props, _testId: testId });
    });
    mock.displayName = testId;
    return mock;
};
/**
 * 对于 mock component 渲染出来的 dom 实例，会对其 props 进行缓存
 * 通过这个方法可以获取到这个组件的 props，用来进行 expect 校验或者触发 props 中的回调函数
 * @param element
 */
export function getPropsOfMockComponent(element) {
    var _a;
    return (_a = propsCollection.get(element)) !== null && _a !== void 0 ? _a : {};
}
//# sourceMappingURL=index.js.map