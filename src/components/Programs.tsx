import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PROGRAM_MEDIA, SITE, programGroupId, type Program } from '../config';

export const STATUS_CHIP: Record<Program['status'], string> = {
  live: 'chip chip-live',
  free: 'chip chip-live',
  soon: 'chip',
  // Waitlist is open but there is nowhere to send anyone yet, so it reads as a
  // state rather than an invitation: no gold, no link. See HANDOFF 5.4.
  waitlist: 'chip chip-waitlist',
};

function ProgramCard({ p, group, reveal }: { p: Program; group: string; reveal: boolean }) {
  const { t } = useTranslation();
  const media = PROGRAM_MEDIA[p.id] ?? {};
  // Cards only become links once the program has a page to point at.
  const Tag = media.href ? 'a' : 'div';
  // Every program is its own destination, so a card always opens in a new tab
  // and leaves the brand hub behind it. Flip SITE.programLinksNewTab to keep
  // the same-origin ones in place instead.
  const newTab = !!media.href && SITE.programLinksNewTab;
  const cls =
    'product-card' +
    (media.span === 'wide' ? ' product-card--wide' : '') +
    (media.image ? ' product-card--media' : '');
  const editKey = (field: string) => `programs.${group}.{i}.${field}`;

  return (
    <Tag
      className={cls}
      // Stacked cards own their own opacity (see useScrollMotion); the reveal
      // animates the same property and the two fight over it.
      {...(reveal ? { 'data-reveal': '' } : {})}
      {...(media.href ? { href: media.href } : {})}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      data-edit-id={`home.programs.${p.id}`}
    >
      {media.image ? (
        <img
          className="product-mockup"
          src={media.image}
          alt={p.title}
          style={media.ratio ? ({ '--mockup-ratio': media.ratio } as CSSProperties) : undefined}
          data-edit-id={`home.programs.${p.id}-image`}
          data-edit-key={editKey('title')}
          data-edit-type="image"
        />
      ) : null}
      <div className="product-body">
        <span className="product-kicker label" data-edit-id={`home.programs.${p.id}-kicker`} data-edit-key={editKey('kicker')}>
          {p.kicker}
        </span>
        <div className="product-head">
          <h3 className="product-title" data-edit-id={`home.programs.${p.id}-title`} data-edit-key={editKey('title')}>
            {p.title}
          </h3>
          {media.href ? (
            <span className="product-arrow" aria-hidden="true">
              ↗
            </span>
          ) : null}
        </div>
        <p className="product-desc" data-edit-id={`home.programs.${p.id}-desc`} data-edit-key={editKey('desc')}>
          {p.desc}
        </p>
        <div className="product-chips">
          <span className={STATUS_CHIP[p.status]} data-edit-id={`home.programs.${p.id}-status`} data-edit-key={`programs.${p.status}`}>
            {t(`programs.${p.status}`)}
          </span>
          {/* Ladder label (5.4). Quieter than the status chip on purpose: it
              says where the program sits in the path, not whether it is open. */}
          {p.tag ? (
            <span className="chip chip-tag" data-edit-id={`home.programs.${p.id}-tag`} data-edit-key={editKey('tag')}>
              {p.tag}
            </span>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}

export default function Programs() {
  const { t } = useTranslation();
  const founders = t('programs.founders', { returnObjects: true }) as Program[];
  const students = t('programs.students', { returnObjects: true }) as Program[];
  // A lone card has nothing to stack under, and pinning it would just park it
  // mid-screen, so the stack only applies to groups with more than one.
  const stacked = (items: Program[]) => SITE.programStack && items.length > 1;
  const gridCls = (items: Program[]) => 'products-grid' + (stacked(items) ? ' products-grid--stack' : '');

  return (
    <section className="section" id="programmata" data-screen-label="Programs" data-edit-section="programs">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.programs.title" data-edit-key="programs.title">
        {t('programs.title')}
      </h2>

      {/* Each band carries its own anchor so the nav dropdown can land on the
          audience you picked rather than the top of the section. */}
      <div className="program-group" id={programGroupId('founders')} data-reveal="">
        <div className="program-group-head">
          <span className="program-group-label label" data-edit-id="home.programs.founders-label" data-edit-key="programs.foundersLabel">
            {t('programs.foundersLabel')}
          </span>
          <span className="program-group-rule" aria-hidden="true" />
        </div>
        <div className={gridCls(founders)}>
          {founders.map((p) => (
            <ProgramCard key={p.id} p={p} group="founders" reveal={!stacked(founders)} />
          ))}
        </div>
      </div>

      <div className="program-group" id={programGroupId('students')} data-reveal="">
        <div className="program-group-head">
          <span className="program-group-label label" data-edit-id="home.programs.students-label" data-edit-key="programs.studentsLabel">
            {t('programs.studentsLabel')}
          </span>
          <span className="program-group-rule" aria-hidden="true" />
        </div>
        <div className={gridCls(students)}>
          {students.map((p) => (
            <ProgramCard key={p.id} p={p} group="students" reveal={!stacked(students)} />
          ))}
        </div>
      </div>
    </section>
  );
}
