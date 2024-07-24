import { type ComponentType } from 'react';
/**
 * 创建一个指定 testid 的虚拟组件
 * 这个虚拟组件会将传入的 props 进行一定的序列化，以能够通过 snapshot 表现出来
 * @param testId
 * @param mockRefFactory
 */
export declare const mockComponent: (testId: string, mockRefFactory?: () => any) => ComponentType<any>;
/**
 * 对于 mock component 渲染出来的 dom 实例，会对其 props 进行缓存
 * 通过这个方法可以获取到这个组件的 props，用来进行 expect 校验或者触发 props 中的回调函数
 * @param element
 */
export declare function getPropsOfMockComponent(element: HTMLElement): {
    [prop: string]: any;
};
