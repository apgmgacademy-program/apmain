import { useTranslation } from 'react-i18next';
import { PATH_LINKS, type Program } from '../config';
import { STATUS_CHIP } from './Programs';

type PathStep = {
  id: string;
  label: string;
  name: string;
  line: string;
  status: Program['status'] | 'conversation';
};

// The value ladder (HANDOFF 5.5): five steps rising left to right, so the shape
// of the offer is readable before any of the copy is. Step 4 carries no
// href on purpose - the Mentorship page does not exist yet and the slug is
// Apollo's to confirm, so guessing one would ship a broken link. Step 2 links
// to the VAULT's own landing page (PATH_LINKS).
//
// No prices here, by decision: the only money word on the whole site is the
// Free label on PowerUp!.
export default function Path() {
  const { t } = useTranslation();
  const steps = t('path.steps', { returnObjects: true }) as PathStep[];

  return (
    <section className="section path" id="path" data-screen-label="The path" data-edit-section="path">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.path.title" data-edit-key="path.title">
        {t('path.title')}
      </h2>
      <p className="path-lede body-l" data-reveal="" data-edit-id="home.path.lede" data-edit-key="path.lede">
        {t('path.lede')}
      </p>

      {/* The track is the scroll container the mobile QA pass asks for: below
          the breakpoint it scrolls sideways on its own rather than pushing the
          page into a horizontal scrollbar. */}
      <ol className="path-track" data-reveal="">
        {steps.map((s, i) => {
          const href = PATH_LINKS[s.id];
          const Tag = href ? 'a' : 'div';
          const external = href?.startsWith('http');
          return (
            <li className="path-step" key={s.id} style={{ '--step': i } as React.CSSProperties}>
              <Tag
                className={'path-card' + (href ? ' path-card--link' : '')}
                {...(href ? { href } : {})}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                data-edit-id={`home.path.${s.id}`}
              >
                <span className="path-num display-font" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="path-label label" data-edit-id={`home.path.${s.id}-label`} data-edit-key="path.steps.{i}.label">
                  {s.label}
                </span>
                <span className="path-name" data-edit-id={`home.path.${s.id}-name`} data-edit-key="path.steps.{i}.name">
                  {s.name}
                </span>
                <span className="path-line" data-edit-id={`home.path.${s.id}-line`} data-edit-key="path.steps.{i}.line">
                  {s.line}
                </span>
                <span
                  className={s.status === 'conversation' ? 'chip' : STATUS_CHIP[s.status]}
                  data-edit-id={`home.path.${s.id}-status`}
                  data-edit-key={`programs.${s.status}`}
                >
                  {t(`programs.${s.status}`)}
                </span>
              </Tag>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
