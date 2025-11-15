import * as React from 'react';
import classNames from 'classnames';

const svgBaseProps = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false',
} as const;

export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
  spin?: boolean;
  rotate?: number;
}

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill: string;
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface IconComponentProps extends IconBaseProps {
  viewBox?: string;
  component?:
    | React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>
    | React.ForwardRefExoticComponent<CustomIconComponentProps>;
  ariaLabel?: React.AriaAttributes['aria-label'];
}

const Icon = React.forwardRef<HTMLSpanElement, IconComponentProps>((props, ref) => {
  const {
    // affect outer <span>...</span>
    className,

    // affect inner <svg>...</svg>
    component: Component,
    viewBox,
    spin,
    rotate,

    tabIndex,
    onClick,

    // children
    children,
    ...restProps
  } = props;

  // Tailwind CSS classes instead of SCSS
  const classString = classNames(
    'inline-block',
    'text-inherit',
    'not-italic',
    'leading-none',
    'text-center',
    'normal-case',
    '-mt-0.5',
    'align-middle',
    'antialiased',
    {
      'cursor-pointer': onClick !== undefined,
    },
    className
  );

  const svgClassString = classNames({
    'animate-spin': !!spin,
  });

  const svgStyle = rotate
    ? {
        transform: `rotate(${rotate}deg)`,
      }
    : undefined;

  const innerSvgProps: CustomIconComponentProps = {
    ...svgBaseProps,
    className: svgClassString,
    style: svgStyle,
    viewBox,
  };

  if (!viewBox) {
    delete innerSvgProps.viewBox;
  }

  // component > children
  const renderInnerNode = () => {
    if (Component) {
      return <Component {...innerSvgProps}>{children}</Component>;
    }

    if (children) {
      return (
        <svg {...innerSvgProps} viewBox={viewBox} className="inline-block">
          {children}
        </svg>
      );
    }

    return null;
  };

  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }

  return (
    <span
      role="img"
      {...restProps}
      ref={ref}
      tabIndex={iconTabIndex}
      onClick={onClick}
      className={classString}
    >
      {renderInnerNode()}
    </span>
  );
});

Icon.displayName = 'Icon';

export default Icon;
