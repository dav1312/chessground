import { Chessground } from '../src/chessground';
import type { DrawShape } from '../src/draw';

const render = (style: 'straight' | 'elbow', shapes: DrawShape[]): HTMLElement => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  Chessground(el, { drawable: { knightArrowStyle: style, shapes } });
  return el;
};

// lines drawn in the shape layer (the arrowhead markers are not lines)
const shapeLines = (el: HTMLElement): SVGLineElement[] =>
  [...el.querySelectorAll('svg.cg-shapes line')] as SVGLineElement[];

describe('knight move arrows', () => {
  beforeEach(() => {
    // jsdom has no layout: give every element a real size so positions are finite
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 800,
      height: 800,
      top: 0,
      left: 0,
      right: 800,
      bottom: 800,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('straight style draws one line for a knight move', () => {
    const el = render('straight', [{ orig: 'b1', dest: 'c3', brush: 'green' }]);
    expect(shapeLines(el).length).toBe(1);
  });

  test('elbow style draws a leg and an arrow for a knight move', () => {
    const el = render('elbow', [{ orig: 'b1', dest: 'c3', brush: 'green' }]);
    const lines = shapeLines(el);
    expect(lines.length).toBe(2);
    // the leg has no arrowhead, the second segment does
    expect(lines.filter(l => l.getAttribute('marker-end')).length).toBe(1);
    expect(lines[0].getAttribute('marker-end')).toBeNull();
  });

  test('elbow style leaves non-knight arrows straight', () => {
    const el = render('elbow', [{ orig: 'b1', dest: 'b5', brush: 'green' }]);
    expect(shapeLines(el).length).toBe(1);
  });

  test('elbow leg runs along the two-square direction first', () => {
    // vertical-major: b1 -> c3 goes up two squares, then sideways
    const v = shapeLines(render('elbow', [{ orig: 'b1', dest: 'c3', brush: 'green' }]));
    expect(v[0].getAttribute('x1')).toBe(v[0].getAttribute('x2'));
    expect(v[0].getAttribute('y1')).not.toBe(v[0].getAttribute('y2'));

    // horizontal-major: b1 -> d2 goes right two squares, then up
    const h = shapeLines(render('elbow', [{ orig: 'b1', dest: 'd2', brush: 'green' }]));
    expect(h[0].getAttribute('y1')).toBe(h[0].getAttribute('y2'));
    expect(h[0].getAttribute('x1')).not.toBe(h[0].getAttribute('x2'));
  });
});
