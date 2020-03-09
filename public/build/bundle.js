
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.19.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (95:1) {#each dataitems as dataitem}
    function create_each_block_1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "1");
    			attr_dev(input, "max", "440");
    			attr_dev(input, "placeholder", input_placeholder_value = /*dataitem*/ ctx[21].data);
    			add_location(input, file, 95, 1, 1652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			dispose = listen_dev(input, "change", onc, false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataitems*/ 256 && input_placeholder_value !== (input_placeholder_value = /*dataitem*/ ctx[21].data)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(95:1) {#each dataitems as dataitem}",
    		ctx
    	});

    	return block;
    }

    // (115:3) {#each dataitems as dataitem}
    function create_each_block(ctx) {
    	let circle;
    	let circle_stroke_value;
    	let circle_stroke_dashoffset_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", /*cx*/ ctx[5]);
    			attr_dev(circle, "cy", /*cy*/ ctx[6]);
    			attr_dev(circle, "r", /*radius*/ ctx[0]);
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", circle_stroke_value = /*dataitem*/ ctx[21].color);
    			attr_dev(circle, "stroke-width", /*stroke*/ ctx[1]);
    			attr_dev(circle, "stroke-dasharray", /*dash*/ ctx[2]);
    			attr_dev(circle, "stroke-dashoffset", circle_stroke_dashoffset_value = /*dataitem*/ ctx[21].offset);
    			add_location(circle, file, 115, 3, 2022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx*/ 32) {
    				attr_dev(circle, "cx", /*cx*/ ctx[5]);
    			}

    			if (dirty & /*cy*/ 64) {
    				attr_dev(circle, "cy", /*cy*/ ctx[6]);
    			}

    			if (dirty & /*radius*/ 1) {
    				attr_dev(circle, "r", /*radius*/ ctx[0]);
    			}

    			if (dirty & /*dataitems*/ 256 && circle_stroke_value !== (circle_stroke_value = /*dataitem*/ ctx[21].color)) {
    				attr_dev(circle, "stroke", circle_stroke_value);
    			}

    			if (dirty & /*stroke*/ 2) {
    				attr_dev(circle, "stroke-width", /*stroke*/ ctx[1]);
    			}

    			if (dirty & /*dash*/ 4) {
    				attr_dev(circle, "stroke-dasharray", /*dash*/ ctx[2]);
    			}

    			if (dirty & /*dataitems*/ 256 && circle_stroke_dashoffset_value !== (circle_stroke_dashoffset_value = /*dataitem*/ ctx[21].offset)) {
    				attr_dev(circle, "stroke-dashoffset", circle_stroke_dashoffset_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(115:3) {#each dataitems as dataitem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let input0;
    	let input0_updating = false;
    	let t2;
    	let input1;
    	let input1_updating = false;
    	let t3;
    	let input2;
    	let input2_updating = false;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let t9;
    	let div;
    	let svg;
    	let circle;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[18].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[19].call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		/*input2_input_handler*/ ctx[20].call(input2);
    	}

    	let each_value_1 = /*dataitems*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*dataitems*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Donut SVG generator";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "Reset";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Add item";
    			t8 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-v2gg4g");
    			add_location(h1, file, 69, 1, 1167);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "step", "1");
    			attr_dev(input0, "placeholder", "radius");
    			add_location(input0, file, 70, 1, 1197);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "placeholder", "stroke");
    			add_location(input1, file, 77, 1, 1293);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "max", "440");
    			attr_dev(input2, "placeholder", "width");
    			add_location(input2, file, 84, 1, 1389);
    			attr_dev(button0, "type", "submit");
    			add_location(button0, file, 92, 1, 1495);
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file, 93, 1, 1558);
    			attr_dev(circle, "cx", /*cx*/ ctx[5]);
    			attr_dev(circle, "cy", /*cy*/ ctx[6]);
    			attr_dev(circle, "r", /*radius*/ ctx[0]);
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "#ccc");
    			attr_dev(circle, "stroke-width", /*stroke*/ ctx[1]);
    			add_location(circle, file, 106, 3, 1867);
    			attr_dev(svg, "width", /*width*/ ctx[3]);
    			attr_dev(svg, "height", /*height*/ ctx[4]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[7]);
    			attr_dev(svg, "class", "donut");
    			attr_dev(svg, "transform", "rotate(-90)");
    			add_location(svg, file, 105, 2, 1793);
    			attr_dev(div, "class", "ch");
    			add_location(div, file, 104, 1, 1774);
    			add_location(main, file, 68, 0, 1159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, input0);
    			set_input_value(input0, /*radius*/ ctx[0]);
    			append_dev(main, t2);
    			append_dev(main, input1);
    			set_input_value(input1, /*stroke*/ ctx[1]);
    			append_dev(main, t3);
    			append_dev(main, input2);
    			set_input_value(input2, /*width*/ ctx[3]);
    			append_dev(main, t4);
    			append_dev(main, button0);
    			append_dev(main, t6);
    			append_dev(main, button1);
    			append_dev(main, t8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(main, null);
    			}

    			append_dev(main, t9);
    			append_dev(main, div);
    			append_dev(div, svg);
    			append_dev(svg, circle);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler),
    				listen_dev(button0, "click", /*handleReset*/ ctx[9], false, false, false),
    				listen_dev(button1, "click", /*additem*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input0_updating && dirty & /*radius*/ 1) {
    				set_input_value(input0, /*radius*/ ctx[0]);
    			}

    			input0_updating = false;

    			if (!input1_updating && dirty & /*stroke*/ 2) {
    				set_input_value(input1, /*stroke*/ ctx[1]);
    			}

    			input1_updating = false;

    			if (!input2_updating && dirty & /*width*/ 8) {
    				set_input_value(input2, /*width*/ ctx[3]);
    			}

    			input2_updating = false;

    			if (dirty & /*dataitems, onc*/ 256) {
    				each_value_1 = /*dataitems*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(main, t9);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*cx*/ 32) {
    				attr_dev(circle, "cx", /*cx*/ ctx[5]);
    			}

    			if (dirty & /*cy*/ 64) {
    				attr_dev(circle, "cy", /*cy*/ ctx[6]);
    			}

    			if (dirty & /*radius*/ 1) {
    				attr_dev(circle, "r", /*radius*/ ctx[0]);
    			}

    			if (dirty & /*stroke*/ 2) {
    				attr_dev(circle, "stroke-width", /*stroke*/ ctx[1]);
    			}

    			if (dirty & /*cx, cy, radius, dataitems, stroke, dash*/ 359) {
    				each_value = /*dataitems*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*width*/ 8) {
    				attr_dev(svg, "width", /*width*/ ctx[3]);
    			}

    			if (dirty & /*height*/ 16) {
    				attr_dev(svg, "height", /*height*/ ctx[4]);
    			}

    			if (dirty & /*viewBox*/ 128) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onc() {
    	console.log("dwdwd");
    }

    function instance($$self, $$props, $$invalidate) {
    	let radius = "75", stroke = "30", dataoffset, it = 0, id = 0;

    	const colors = [
    		{ color: "#50aef4" },
    		{ color: "#3ab011" },
    		{ color: "#ff8e29" },
    		{ color: "#890c85" },
    		{ color: "#e91e25" },
    		{ color: "#ffc83f" }
    	];

    	function summd() {
    		let sum = 0;
    		dataitems.map(e => sum = sum + e.data);

    		dataitems.map(f => {
    			if (f.id === dataitems.length - 1) return;
    			f.offset = dash - f.data / sum * dash * (f.id + 1);
    		});
    	}

    	function handleReset() {
    		$$invalidate(3, width = "180");
    		$$invalidate(0, radius = "75");
    		$$invalidate(1, stroke = "30");
    		it = 0;
    		id = 0;
    		$$invalidate(8, dataitems = dataitems.splice(...dataitems, dataitems.length));
    	}

    	function additem() {
    		$$invalidate(8, dataitems = dataitems.concat(dataitems.splice(0, 0, {
    			id,
    			data: 100,
    			offset: 0,
    			color: colors[it].color
    		})));

    		summd();
    		++id;
    		++it;

    		if (it >= 5) {
    			it = 0;
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input0_input_handler() {
    		radius = to_number(this.value);
    		$$invalidate(0, radius);
    	}

    	function input1_input_handler() {
    		stroke = to_number(this.value);
    		$$invalidate(1, stroke);
    	}

    	function input2_input_handler() {
    		width = to_number(this.value);
    		$$invalidate(3, width);
    	}

    	$$self.$capture_state = () => ({
    		radius,
    		stroke,
    		dataoffset,
    		it,
    		id,
    		colors,
    		summd,
    		onc,
    		handleReset,
    		additem,
    		dash,
    		width,
    		height,
    		vbWidth,
    		cx,
    		vbHeight,
    		cy,
    		viewBox,
    		dataitems
    	});

    	$$self.$inject_state = $$props => {
    		if ("radius" in $$props) $$invalidate(0, radius = $$props.radius);
    		if ("stroke" in $$props) $$invalidate(1, stroke = $$props.stroke);
    		if ("dataoffset" in $$props) dataoffset = $$props.dataoffset;
    		if ("it" in $$props) it = $$props.it;
    		if ("id" in $$props) id = $$props.id;
    		if ("dash" in $$props) $$invalidate(2, dash = $$props.dash);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("vbWidth" in $$props) $$invalidate(13, vbWidth = $$props.vbWidth);
    		if ("cx" in $$props) $$invalidate(5, cx = $$props.cx);
    		if ("vbHeight" in $$props) $$invalidate(14, vbHeight = $$props.vbHeight);
    		if ("cy" in $$props) $$invalidate(6, cy = $$props.cy);
    		if ("viewBox" in $$props) $$invalidate(7, viewBox = $$props.viewBox);
    		if ("dataitems" in $$props) $$invalidate(8, dataitems = $$props.dataitems);
    	};

    	let dash;
    	let width;
    	let height;
    	let vbWidth;
    	let cx;
    	let vbHeight;
    	let cy;
    	let viewBox;
    	let dataitems;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*radius*/ 1) {
    			 $$invalidate(2, dash = 2 * radius * 3.14);
    		}

    		if ($$self.$$.dirty & /*width*/ 8) {
    			 $$invalidate(4, height = width);
    		}

    		if ($$self.$$.dirty & /*radius, stroke*/ 3) {
    			 $$invalidate(13, vbWidth = parseInt(radius) * 2 + parseInt(stroke));
    		}

    		if ($$self.$$.dirty & /*radius, stroke*/ 3) {
    			 $$invalidate(5, cx = parseInt(radius) + parseInt(stroke) / 2);
    		}

    		if ($$self.$$.dirty & /*vbWidth*/ 8192) {
    			 $$invalidate(14, vbHeight = vbWidth);
    		}

    		if ($$self.$$.dirty & /*cx*/ 32) {
    			 $$invalidate(6, cy = cx);
    		}

    		if ($$self.$$.dirty & /*vbWidth, vbHeight*/ 24576) {
    			 $$invalidate(7, viewBox = `0 0 ${vbWidth} ${vbHeight}`);
    		}
    	};

    	 $$invalidate(3, width = "180");
    	 $$invalidate(8, dataitems = []);

    	return [
    		radius,
    		stroke,
    		dash,
    		width,
    		height,
    		cx,
    		cy,
    		viewBox,
    		dataitems,
    		handleReset,
    		additem,
    		it,
    		id,
    		vbWidth,
    		vbHeight,
    		dataoffset,
    		colors,
    		summd,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: "world"
    	}
    });

    // {width/2} {width/2}

    return app;

}());
//# sourceMappingURL=bundle.js.map
