import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  createButton,
  createModalDialog,
  createPageHero,
  createPanelSection,
} from "@lunarq/frontend-shared";
import "@lunarq/frontend-shared/maintenance/index.css";
import { getHelpSection, type HelpItem } from "./help/sections";

const Button = createButton(React);
const ModalDialog = createModalDialog(React);
const PageHero = createPageHero(React);
const PanelSection = createPanelSection(React);

function HelpExampleModal({
  item,
  onClose,
}: {
  item: HelpItem;
  onClose: () => void;
}) {
  const Example = item.Example;
  const [maximized, setMaximized] = React.useState(false);

  React.useEffect(() => {
    setMaximized(false);
  }, [item.id]);

  return (
    <ModalDialog
      title={item.title}
      subtitle="Live example and copy-ready code"
      contentClassName={[
        "showcase-help-modal",
        maximized ? "showcase-help-modal-maximized" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      bodyClassName="showcase-help-modal-body"
      onClose={onClose}
      headerActions={
        <button
          type="button"
          className="showcase-help-modal-maximize"
          onClick={() => setMaximized((current) => !current)}
          aria-label={maximized ? "Restore dialog size" : "Maximize dialog"}
          title={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? "❐" : "□"}
        </button>
      }
      footer={
        <div className="showcase-help-modal-footer">
          <Button
            variant="secondary"
            onClick={() => setMaximized((current) => !current)}
          >
            {maximized ? "Restore" : "Maximize"}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <section className="showcase-help-example">
        <h4>Working example</h4>
        <div className="showcase-help-example-preview">
          <Example />
        </div>
      </section>
      <section className="showcase-help-example">
        <h4>Code</h4>
        <pre className="showcase-code-block">
          <code>{item.code}</code>
        </pre>
      </section>
    </ModalDialog>
  );
}

function findHelpItem(sectionId: string | undefined, exampleId: string | null): HelpItem | null {
  if (!exampleId) {
    return null;
  }
  const section = getHelpSection(sectionId);
  for (const group of section.groups) {
    const match = group.items.find((item) => item.id === exampleId);
    if (match) {
      return match;
    }
  }
  return null;
}

export default function HelpPage() {
  const { sectionId } = useParams<{ sectionId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = getHelpSection(sectionId);
  const exampleId = searchParams.get("example");
  const activeItem = React.useMemo(
    () => findHelpItem(sectionId, exampleId),
    [exampleId, sectionId],
  );

  const openExample = (item: HelpItem) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("example", item.id);
        return next;
      },
      { replace: false },
    );
  };

  const closeExample = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("example");
        return next;
      },
      { replace: true },
    );
  };

  const itemCount = section.groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <div className="showcase-page showcase-help-page">
      <PageHero
        eyebrow="Help"
        title={section.title}
        description={section.description}
        actions={
          <div className="showcase-help-section-meta">
            {section.groups.length} groups · {itemCount} topics
          </div>
        }
      />

      {section.groups.map((group) => (
        <PanelSection
          key={group.id}
          eyebrow={group.eyebrow}
          title={group.title}
          meta={`${group.items.length} topic${group.items.length === 1 ? "" : "s"}`}
          compact
        >
          <div className="showcase-help-list">
            {group.items.map((item) => (
              <article key={item.id} className="showcase-help-item">
                <div className="showcase-help-item-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <Button variant="secondary" onClick={() => openExample(item)}>
                  View example
                </Button>
              </article>
            ))}
          </div>
        </PanelSection>
      ))}

      {activeItem ? <HelpExampleModal item={activeItem} onClose={closeExample} /> : null}
    </div>
  );
}
