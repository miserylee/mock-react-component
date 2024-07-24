/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  cloneElement,
  type ComponentType,
  forwardRef,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';

const propsCollection = new WeakMap<HTMLElement, { [prop: string]: any }>();

const placeholderDiv = document.createElement('div');

function format(item: unknown) {
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

function SnapshotRenderer({
  _testId,
  ...props
}: PropsWithChildren<{
  _testId: string;
  [prop: string]: any;
}>): ReactElement {
  const elementRef = useRef<HTMLDivElement>(placeholderDiv);
  useEffect(() => {
    propsCollection.set(elementRef.current, props);
  }, [props]);

  const propsSnapshot: [string, ReactElement | string | (ReactElement | string)[]][] = [];
  Object.entries(props).forEach(([prop, value]) => {
    if (Array.isArray(value)) {
      if (prop === 'children') {
        value = value.flat();
      }
      propsSnapshot.push([
        prop,
        (value as unknown[]).map((item, key) =>
          isValidElement(item) ? cloneElement(item, { key }) : format(item)
        ),
      ]);
    } else {
      propsSnapshot.push([prop, isValidElement(value) ? value : format(value)]);
    }
  });
  return (
    <div data-testid={_testId} ref={elementRef}>
      {propsSnapshot.map(([prop, value]) => {
        if (typeof value === 'string') {
          return (
            <div
              data-testid={`${_testId}_prop_${prop}`}
              key={prop}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: value }}
            />
          );
        }
        return (
          <div data-testid={`${_testId}_prop_${prop}`} key={prop}>
            {value}
          </div>
        );
      })}
    </div>
  );
}

/**
 * 创建一个指定 testid 的虚拟组件
 * 这个虚拟组件会将传入的 props 进行一定的序列化，以能够通过 snapshot 表现出来
 * @param testId
 * @param mockRefFactory
 */
export const mockComponent = (testId: string, mockRefFactory?: () => any): ComponentType<any> => {
  const mock = forwardRef((props: PropsWithChildren<object>, ref): JSX.Element => {
    useImperativeHandle(ref, () => {
      return mockRefFactory?.();
    }, []);

    return <SnapshotRenderer {...props} _testId={testId} />;
  });
  mock.displayName = testId;
  return mock;
};

/**
 * 对于 mock component 渲染出来的 dom 实例，会对其 props 进行缓存
 * 通过这个方法可以获取到这个组件的 props，用来进行 expect 校验或者触发 props 中的回调函数
 * @param element
 */
export function getPropsOfMockComponent(element: HTMLElement): { [prop: string]: any } {
  return propsCollection.get(element) ?? {};
}
