
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    /* src/components/Svgbox.svelte generated by Svelte v3.19.2 */

    const file = "src/components/Svgbox.svelte";

    function create_fragment(ctx) {
    	let div;
    	let svg;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[2]);
    			add_location(svg, file, 5, 1, 80);
    			attr_dev(div, "class", "chart-box svelte-mba3xc");
    			add_location(div, file, 4, 0, 55);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (!current || dirty & /*viewBox*/ 4) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { width } = $$props, { height } = $$props, { viewBox } = $$props;
    	const writable_props = ["width", "height", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svgbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Svgbox", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewBox" in $$props) $$invalidate(2, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ width, height, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewBox" in $$props) $$invalidate(2, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, viewBox, $$scope, $$slots];
    }

    class Svgbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { width: 0, height: 1, viewBox: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svgbox",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Svgbox> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[1] === undefined && !("height" in props)) {
    			console.warn("<Svgbox> was created without expected prop 'height'");
    		}

    		if (/*viewBox*/ ctx[2] === undefined && !("viewBox" in props)) {
    			console.warn("<Svgbox> was created without expected prop 'viewBox'");
    		}
    	}

    	get width() {
    		throw new Error("<Svgbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Svgbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Svgbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Svgbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<Svgbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Svgbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Svgarc.svelte generated by Svelte v3.19.2 */

    const file$1 = "src/components/Svgarc.svelte";

    function create_fragment$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "id", /*arcID*/ ctx[0]);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", /*arcFill*/ ctx[2]);
    			attr_dev(path, "stroke-width", /*arcWidth*/ ctx[3]);
    			attr_dev(path, "d", /*arcData*/ ctx[1]);
    			add_location(path, file$1, 4, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*arcID*/ 1) {
    				attr_dev(path, "id", /*arcID*/ ctx[0]);
    			}

    			if (dirty & /*arcFill*/ 4) {
    				attr_dev(path, "stroke", /*arcFill*/ ctx[2]);
    			}

    			if (dirty & /*arcWidth*/ 8) {
    				attr_dev(path, "stroke-width", /*arcWidth*/ ctx[3]);
    			}

    			if (dirty & /*arcData*/ 2) {
    				attr_dev(path, "d", /*arcData*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { arcID } = $$props,
    		{ arcData } = $$props,
    		{ arcFill } = $$props,
    		{ arcWidth } = $$props;

    	const writable_props = ["arcID", "arcData", "arcFill", "arcWidth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svgarc> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Svgarc", $$slots, []);

    	$$self.$set = $$props => {
    		if ("arcID" in $$props) $$invalidate(0, arcID = $$props.arcID);
    		if ("arcData" in $$props) $$invalidate(1, arcData = $$props.arcData);
    		if ("arcFill" in $$props) $$invalidate(2, arcFill = $$props.arcFill);
    		if ("arcWidth" in $$props) $$invalidate(3, arcWidth = $$props.arcWidth);
    	};

    	$$self.$capture_state = () => ({ arcID, arcData, arcFill, arcWidth });

    	$$self.$inject_state = $$props => {
    		if ("arcID" in $$props) $$invalidate(0, arcID = $$props.arcID);
    		if ("arcData" in $$props) $$invalidate(1, arcData = $$props.arcData);
    		if ("arcFill" in $$props) $$invalidate(2, arcFill = $$props.arcFill);
    		if ("arcWidth" in $$props) $$invalidate(3, arcWidth = $$props.arcWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [arcID, arcData, arcFill, arcWidth];
    }

    class Svgarc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			arcID: 0,
    			arcData: 1,
    			arcFill: 2,
    			arcWidth: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svgarc",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*arcID*/ ctx[0] === undefined && !("arcID" in props)) {
    			console.warn("<Svgarc> was created without expected prop 'arcID'");
    		}

    		if (/*arcData*/ ctx[1] === undefined && !("arcData" in props)) {
    			console.warn("<Svgarc> was created without expected prop 'arcData'");
    		}

    		if (/*arcFill*/ ctx[2] === undefined && !("arcFill" in props)) {
    			console.warn("<Svgarc> was created without expected prop 'arcFill'");
    		}

    		if (/*arcWidth*/ ctx[3] === undefined && !("arcWidth" in props)) {
    			console.warn("<Svgarc> was created without expected prop 'arcWidth'");
    		}
    	}

    	get arcID() {
    		throw new Error("<Svgarc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arcID(value) {
    		throw new Error("<Svgarc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arcData() {
    		throw new Error("<Svgarc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arcData(value) {
    		throw new Error("<Svgarc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arcFill() {
    		throw new Error("<Svgarc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arcFill(value) {
    		throw new Error("<Svgarc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arcWidth() {
    		throw new Error("<Svgarc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arcWidth(value) {
    		throw new Error("<Svgarc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DataItems.svelte generated by Svelte v3.19.2 */

    const file$2 = "src/components/DataItems.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "data-items");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataItems> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DataItems", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class DataItems extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataItems",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/SVGSettings.svelte generated by Svelte v3.19.2 */

    const file$3 = "src/components/SVGSettings.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "SETTINGS";
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(h4, "class", "svelte-dh28gm");
    			add_location(h4, file$3, 1, 1, 28);
    			attr_dev(div, "class", "svg-settings");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SVGSettings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SVGSettings", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class SVGSettings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SVGSettings",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/LabelInput.svelte generated by Svelte v3.19.2 */

    const file$4 = "src/components/LabelInput.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let input;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*labelName*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr_dev(div0, "class", "label");
    			add_location(div0, file$4, 5, 1, 88);
    			attr_dev(input, "class", "labeled-input svelte-1ihiw3w");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "name", "");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			add_location(input, file$4, 6, 1, 126);
    			attr_dev(div1, "class", "labeled-input-box svelte-1ihiw3w");
    			add_location(div1, file$4, 4, 0, 55);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, input);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*labelName*/ 2) set_data_dev(t0, /*labelName*/ ctx[1]);

    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { placeholder } = $$props, { labelName } = $$props;
    	const writable_props = ["placeholder", "labelName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LabelInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LabelInput", $$slots, []);

    	$$self.$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("labelName" in $$props) $$invalidate(1, labelName = $$props.labelName);
    	};

    	$$self.$capture_state = () => ({ placeholder, labelName });

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("labelName" in $$props) $$invalidate(1, labelName = $$props.labelName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placeholder, labelName];
    }

    class LabelInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { placeholder: 0, labelName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LabelInput",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*placeholder*/ ctx[0] === undefined && !("placeholder" in props)) {
    			console.warn("<LabelInput> was created without expected prop 'placeholder'");
    		}

    		if (/*labelName*/ ctx[1] === undefined && !("labelName" in props)) {
    			console.warn("<LabelInput> was created without expected prop 'labelName'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<LabelInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<LabelInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelName() {
    		throw new Error("<LabelInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelName(value) {
    		throw new Error("<LabelInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.2 */
    const file$5 = "src/App.svelte";

    // (47:3) <Svgbox {width} {height} {viewBox}>
    function create_default_slot_2(ctx) {
    	let current;

    	const svgarc = new Svgarc({
    			props: {
    				arcFill: /*color*/ ctx[3],
    				arcWidth: 20,
    				arcData: describeArc(/*cx*/ ctx[5], /*cy*/ ctx[6], /*r*/ ctx[4], 0, 270)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgarc.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgarc, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgarc.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgarc.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgarc, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(47:3) <Svgbox {width} {height} {viewBox}>",
    		ctx
    	});

    	return block;
    }

    // (51:4) <SVGSettings>
    function create_default_slot_1(ctx) {
    	let current;

    	const labelinput = new LabelInput({
    			props: {
    				labelName: "wdwdwd",
    				placeholder: "wdwddw"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labelinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labelinput, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labelinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labelinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labelinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(51:4) <SVGSettings>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;

    	const svgbox = new Svgbox({
    			props: {
    				width: /*width*/ ctx[0],
    				height: /*height*/ ctx[1],
    				viewBox: /*viewBox*/ ctx[2],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const svgsettings = new SVGSettings({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const dataitems = new DataItems({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(svgbox.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(svgsettings.$$.fragment);
    			t1 = space();
    			create_component(dataitems.$$.fragment);
    			attr_dev(div0, "class", "settings svelte-veghrh");
    			add_location(div0, file$5, 49, 3, 1404);
    			attr_dev(div1, "class", "content svelte-veghrh");
    			add_location(div1, file$5, 45, 2, 1242);
    			attr_dev(div2, "class", "wrapper svelte-veghrh");
    			add_location(div2, file$5, 44, 1, 1218);
    			add_location(main, file$5, 43, 0, 1210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			mount_component(svgbox, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(svgsettings, div0, null);
    			append_dev(div0, t1);
    			mount_component(dataitems, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svgbox_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				svgbox_changes.$$scope = { dirty, ctx };
    			}

    			svgbox.$set(svgbox_changes);
    			const svgsettings_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				svgsettings_changes.$$scope = { dirty, ctx };
    			}

    			svgsettings.$set(svgsettings_changes);
    			const dataitems_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				dataitems_changes.$$scope = { dirty, ctx };
    			}

    			dataitems.$set(dataitems_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgbox.$$.fragment, local);
    			transition_in(svgsettings.$$.fragment, local);
    			transition_in(dataitems.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgbox.$$.fragment, local);
    			transition_out(svgsettings.$$.fragment, local);
    			transition_out(dataitems.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svgbox);
    			destroy_component(svgsettings);
    			destroy_component(dataitems);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    	var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

    	return {
    		x: centerX + radius * Math.cos(angleInRadians),
    		y: centerY + radius * Math.sin(angleInRadians)
    	};
    }

    function describeArc(x, y, radius, startAngle, endAngle) {
    	var start = polarToCartesian(x, y, radius, endAngle);
    	var end = polarToCartesian(x, y, radius, startAngle);
    	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    	var d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
    	return d;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let radius = 200;

    	let width = "300",
    		height = "300",
    		viewBox = `0 0 ${width} ${height}`,
    		color = "#333333",
    		strokeWidth = "20";

    	let r = parseInt(width) / 2 - parseInt(strokeWidth) + parseInt(strokeWidth) / 2;
    	let cx = parseInt(width) / 2;
    	let cy = parseInt(height) / 2;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Svgbox,
    		Svgarc,
    		DataItems,
    		SVGSettings,
    		LabelInput,
    		radius,
    		polarToCartesian,
    		describeArc,
    		width,
    		height,
    		viewBox,
    		color,
    		strokeWidth,
    		r,
    		cx,
    		cy
    	});

    	$$self.$inject_state = $$props => {
    		if ("radius" in $$props) radius = $$props.radius;
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewBox" in $$props) $$invalidate(2, viewBox = $$props.viewBox);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("strokeWidth" in $$props) strokeWidth = $$props.strokeWidth;
    		if ("r" in $$props) $$invalidate(4, r = $$props.r);
    		if ("cx" in $$props) $$invalidate(5, cx = $$props.cx);
    		if ("cy" in $$props) $$invalidate(6, cy = $$props.cy);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, viewBox, color, r, cx, cy];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    // {width/2} {width/2}

    return app;

}());
//# sourceMappingURL=bundle.js.map
