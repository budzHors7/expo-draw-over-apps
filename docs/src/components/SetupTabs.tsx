'use client';

import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

type SetupTabProps = {
  children: ReactNode;
  id: string;
  label: string;
};

export function SetupTab(_props: SetupTabProps) {
  return null;
}

export function SetupTabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<SetupTabProps> => isValidElement<SetupTabProps>(child)
  );
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.props.id ?? '');
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const instanceId = useId().replaceAll(':', '');

  function selectTab(index: number) {
    const nextTab = tabs[index];
    if (!nextTab) return;
    setActiveTab(nextTab.props.id);
    tabButtons.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex != null) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  }

  return (
    <div className="setup-tabs">
      <div aria-label="Project setup" className="setup-tab-list" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = tab.props.id === activeTab;
          const tabId = `${instanceId}-${tab.props.id}-tab`;
          const panelId = `${instanceId}-${tab.props.id}-panel`;

          return (
            <button
              aria-controls={panelId}
              aria-selected={isActive}
              className="setup-tab-button"
              id={tabId}
              key={tab.props.id}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(element) => {
                tabButtons.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.props.id === activeTab;
        const tabId = `${instanceId}-${tab.props.id}-tab`;
        const panelId = `${instanceId}-${tab.props.id}-panel`;

        return (
          <div
            aria-labelledby={tabId}
            className="setup-tab-panel"
            hidden={!isActive}
            id={panelId}
            key={tab.props.id}
            role="tabpanel"
            tabIndex={0}
          >
            {tab.props.children}
          </div>
        );
      })}
    </div>
  );
}
