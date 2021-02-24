
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function empty() {
        return text('');
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
            set_current_component(null);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.32.3 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
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
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.32.3 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.32.3 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
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
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8320) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/pages/Home.svelte generated by Svelte v3.32.3 */

    const { document: document_1 } = globals;
    const file$1 = "src/pages/Home.svelte";

    function create_fragment$3(ctx) {
    	let meta;
    	let t0;
    	let div1;
    	let svg0;
    	let path0;
    	let t1;
    	let div0;
    	let h1;
    	let t2;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let button0;
    	let t5;
    	let t6;
    	let button1;
    	let t7;
    	let t8;
    	let p;
    	let t9;
    	let a;
    	let t10;
    	let t11;
    	let svg1;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			t2 = text("Nalara Store");
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			button0 = element("button");
    			t5 = text("Take a Look");
    			t6 = space();
    			button1 = element("button");
    			t7 = text("Sign in");
    			t8 = space();
    			p = element("p");
    			t9 = text("Don't have an account? ");
    			a = element("a");
    			t10 = text("Sign up");
    			t11 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-14qrodw\"]", document_1.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			svg0 = claim_element(
    				div1_nodes,
    				"svg",
    				{
    					style: true,
    					class: true,
    					xmlns: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);

    			path0 = claim_element(
    				svg0_nodes,
    				"path",
    				{
    					fill: true,
    					"fill-opacity": true,
    					d: true
    				},
    				1
    			);

    			children(path0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h1 = claim_element(div0_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t2 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t3 = claim_space(div0_nodes);
    			img = claim_element(div0_nodes, "IMG", { src: true, alt: true, class: true });
    			t4 = claim_space(div0_nodes);
    			button0 = claim_element(div0_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t5 = claim_text(button0_nodes, "Take a Look");
    			button0_nodes.forEach(detach_dev);
    			t6 = claim_space(div0_nodes);
    			button1 = claim_element(div0_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t7 = claim_text(button1_nodes, "Sign in");
    			button1_nodes.forEach(detach_dev);
    			t8 = claim_space(div0_nodes);
    			p = claim_element(div0_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t9 = claim_text(p_nodes, "Don't have an account? ");
    			a = claim_element(p_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			t10 = claim_text(a_nodes, "Sign up");
    			a_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t11 = claim_space(div1_nodes);

    			svg1 = claim_element(
    				div1_nodes,
    				"svg",
    				{
    					style: true,
    					class: true,
    					xmlns: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);

    			path1 = claim_element(
    				svg1_nodes,
    				"path",
    				{
    					fill: true,
    					"fill-opacity": true,
    					d: true
    				},
    				1
    			);

    			children(path1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1.title = "Nalara Store";
    			attr_dev(meta, "content", "#fff");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$1, 40, 4, 1244);
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "fill-opacity", "1");
    			attr_dev(path0, "d", "M0,160L48,181.3C96,203,192,245,288,229.3C384,213,480,139,576,106.7C672,75,768,85,864,106.7C960,128,1056,160,1152,192C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
    			add_location(path0, file$1, 44, 121, 1465);
    			set_style(svg0, "top", "-" + (/*topWaves*/ ctx[0] / 2 - 16) + "px");
    			attr_dev(svg0, "class", "top-waves svelte-5jtkay");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 1440 320");
    			add_location(svg0, file$1, 44, 4, 1348);
    			attr_dev(h1, "class", "svelte-5jtkay");
    			add_location(h1, file$1, 46, 8, 1848);
    			if (img.src !== (img_src_value = "/src/img/Stuck at Home Group Call.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Stuck at Home Group Call");
    			attr_dev(img, "class", "svelte-5jtkay");
    			add_location(img, file$1, 47, 8, 1878);
    			attr_dev(button0, "class", "row middle-xs center-xs svelte-5jtkay");
    			add_location(button0, file$1, 48, 8, 1969);
    			attr_dev(button1, "class", "row middle-xs center-xs svelte-5jtkay");
    			add_location(button1, file$1, 51, 8, 2142);
    			attr_dev(a, "href", "/signup");
    			attr_dev(a, "class", "svelte-5jtkay");
    			add_location(a, file$1, 55, 35, 2351);
    			attr_dev(p, "class", "svelte-5jtkay");
    			add_location(p, file$1, 54, 8, 2312);
    			attr_dev(div0, "class", "box svelte-5jtkay");
    			add_location(div0, file$1, 45, 4, 1822);
    			attr_dev(path1, "fill", "#fff");
    			attr_dev(path1, "fill-opacity", "1");
    			attr_dev(path1, "d", "M0,160L48,181.3C96,203,192,245,288,229.3C384,213,480,139,576,106.7C672,75,768,85,864,106.7C960,128,1056,160,1152,192C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z");
    			add_location(path1, file$1, 58, 123, 2537);
    			set_style(svg1, "bottom", "-" + (/*botWaves*/ ctx[1] / 2 - 16) + "px");
    			attr_dev(svg1, "class", "bot-waves svelte-5jtkay");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 1440 320");
    			add_location(svg1, file$1, 58, 4, 2418);
    			attr_dev(div1, "class", "full row center-xs bottom-xs svelte-5jtkay");
    			add_location(div1, file$1, 43, 0, 1301);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, img);
    			append_dev(div0, t4);
    			append_dev(div0, button0);
    			append_dev(button0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(button1, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p);
    			append_dev(p, t9);
    			append_dev(p, a);
    			append_dev(a, t10);
    			append_dev(div1, t11);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					action_destroyer(link.call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*topWaves*/ 1) {
    				set_style(svg0, "top", "-" + (/*topWaves*/ ctx[0] / 2 - 16) + "px");
    			}

    			if (dirty & /*botWaves*/ 2) {
    				set_style(svg1, "bottom", "-" + (/*botWaves*/ ctx[1] / 2 - 16) + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
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

    function createRipple(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	let topWaves, botWaves;

    	onMount(() => {
    		$$invalidate(0, topWaves = document.querySelector(".top-waves").clientHeight);
    		$$invalidate(1, botWaves = document.querySelector(".bot-waves").clientHeight);
    	});

    	window.addEventListener("resize", () => {
    		if (location.pathname == "/") {
    			$$invalidate(0, topWaves = document.querySelector(".top-waves").clientHeight);
    			$$invalidate(1, botWaves = document.querySelector(".bot-waves").clientHeight);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => {
    		createRipple(e, "rgba(255, 255, 255, 0.7)");
    		navigate("/home");
    	};

    	const click_handler_1 = e => {
    		createRipple(e, "rgba(34, 145, 255, 0.2)");
    		navigate("/signin");
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		link,
    		navigate,
    		topWaves,
    		botWaves,
    		createRipple
    	});

    	$$self.$inject_state = $$props => {
    		if ("topWaves" in $$props) $$invalidate(0, topWaves = $$props.topWaves);
    		if ("botWaves" in $$props) $$invalidate(1, botWaves = $$props.botWaves);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [topWaves, botWaves, click_handler, click_handler_1];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/user/Signin.svelte generated by Svelte v3.32.3 */

    const { document: document_1$1 } = globals;
    const file$2 = "src/pages/user/Signin.svelte";

    function create_fragment$4(ctx) {
    	let meta;
    	let t0;
    	let div5;
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let t2;
    	let h3;
    	let t3;
    	let t4;
    	let div0;
    	let svg0;
    	let path0;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let svg1;
    	let path1;
    	let t7;
    	let input1;
    	let t8;
    	let a0;
    	let t9;
    	let t10;
    	let div4;
    	let button;
    	let t11;
    	let t12;
    	let p;
    	let t13;
    	let a1;
    	let t14;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			t1 = text("Nalara Store");
    			t2 = space();
    			h3 = element("h3");
    			t3 = text("My Accoount");
    			t4 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			a0 = element("a");
    			t9 = text("Forgot !");
    			t10 = space();
    			div4 = element("div");
    			button = element("button");
    			t11 = text("Sign in");
    			t12 = space();
    			p = element("p");
    			t13 = text("Don't have an account? ");
    			a1 = element("a");
    			t14 = text("Sign up");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-11un5ij\"]", document_1$1.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div5 = claim_element(nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			h1 = claim_element(div2_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			h3 = claim_element(div2_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t3 = claim_text(h3_nodes, "My Accoount");
    			h3_nodes.forEach(detach_dev);
    			t4 = claim_space(div2_nodes);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			svg0 = claim_element(
    				div0_nodes,
    				"svg",
    				{
    					style: true,
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);
    			path0 = claim_element(svg0_nodes, "path", { d: true, fill: true }, 1);
    			children(path0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			t5 = claim_space(div0_nodes);

    			input0 = claim_element(div0_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t6 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			svg1 = claim_element(
    				div1_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);
    			path1 = claim_element(svg1_nodes, "path", { d: true, fill: true }, 1);
    			children(path1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);

    			input1 = claim_element(div1_nodes, "INPUT", {
    				style: true,
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			t8 = claim_space(div1_nodes);
    			a0 = claim_element(div1_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			t9 = claim_text(a0_nodes, "Forgot !");
    			a0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t10 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			button = claim_element(div4_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t11 = claim_text(button_nodes, "Sign in");
    			button_nodes.forEach(detach_dev);
    			t12 = claim_space(div4_nodes);
    			p = claim_element(div4_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t13 = claim_text(p_nodes, "Don't have an account? ");
    			a1 = claim_element(p_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			t14 = claim_text(a1_nodes, "Sign up");
    			a1_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1$1.title = "Sign in - Nalara Store";
    			attr_dev(meta, "content", "#2291FF");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$2, 46, 4, 1323);
    			attr_dev(h1, "class", "svelte-15rf5nc");
    			add_location(h1, file$2, 52, 12, 1501);
    			attr_dev(h3, "class", "svelte-15rf5nc");
    			add_location(h3, file$2, 53, 12, 1535);
    			attr_dev(path0, "d", "M26.6667 0H1.77778C1.30628 0 0.854097 0.187301 0.520699 0.520699C0.187301 0.854097 0 1.30628 0 1.77778V19.5556C0 20.0271 0.187301 20.4792 0.520699 20.8126C0.854097 21.146 1.30628 21.3333 1.77778 21.3333H26.6667C27.1382 21.3333 27.5903 21.146 27.9237 20.8126C28.2571 20.4792 28.4444 20.0271 28.4444 19.5556V1.77778C28.4444 1.30628 28.2571 0.854097 27.9237 0.520699C27.5903 0.187301 27.1382 0 26.6667 0ZM25.2978 19.5556H3.25333L9.47555 13.12L8.19556 11.8844L1.77778 18.5244V3.12889L12.8267 14.1244C13.1598 14.4556 13.6103 14.6414 14.08 14.6414C14.5497 14.6414 15.0002 14.4556 15.3333 14.1244L26.6667 2.85333V18.4089L20.1244 11.8667L18.8711 13.12L25.2978 19.5556ZM2.94222 1.77778H25.2267L14.08 12.8622L2.94222 1.77778Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$2, 56, 20, 1738);
    			set_style(svg0, "bottom", "18px");
    			attr_dev(svg0, "width", "22");
    			attr_dev(svg0, "height", "17");
    			attr_dev(svg0, "viewBox", "0 0 28 22");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-15rf5nc");
    			add_location(svg0, file$2, 55, 16, 1602);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "autocomplete", "off");
    			attr_dev(input0, "placeholder", "Email Address");
    			attr_dev(input0, "class", "svelte-15rf5nc");
    			add_location(input0, file$2, 58, 16, 2529);
    			attr_dev(div0, "class", "inp svelte-15rf5nc");
    			add_location(div0, file$2, 54, 12, 1568);
    			attr_dev(path1, "d", "M11 15.3333C10.5941 15.3286 10.1964 15.4483 9.8606 15.6764C9.52477 15.9045 9.26687 16.23 9.12163 16.6091C8.97638 16.9882 8.95076 17.4027 9.04821 17.7968C9.14565 18.1908 9.3615 18.5456 9.66668 18.8133V20.6667C9.66668 21.0203 9.80715 21.3594 10.0572 21.6095C10.3072 21.8595 10.6464 22 11 22C11.3536 22 11.6928 21.8595 11.9428 21.6095C12.1929 21.3594 12.3333 21.0203 12.3333 20.6667V18.8133C12.6385 18.5456 12.8544 18.1908 12.9518 17.7968C13.0493 17.4027 13.0236 16.9882 12.8784 16.6091C12.7331 16.23 12.4753 15.9045 12.1394 15.6764C11.8036 15.4483 11.4059 15.3286 11 15.3333ZM17.6667 10V7.33334C17.6667 5.56523 16.9643 3.86954 15.7141 2.61929C14.4638 1.36905 12.7681 0.666672 11 0.666672C9.2319 0.666672 7.53621 1.36905 6.28596 2.61929C5.03572 3.86954 4.33334 5.56523 4.33334 7.33334V10C3.27248 10 2.25506 10.4214 1.50492 11.1716C0.754771 11.9217 0.333344 12.9391 0.333344 14V23.3333C0.333344 24.3942 0.754771 25.4116 1.50492 26.1618C2.25506 26.9119 3.27248 27.3333 4.33334 27.3333H17.6667C18.7275 27.3333 19.745 26.9119 20.4951 26.1618C21.2452 25.4116 21.6667 24.3942 21.6667 23.3333V14C21.6667 12.9391 21.2452 11.9217 20.4951 11.1716C19.745 10.4214 18.7275 10 17.6667 10ZM7.00001 7.33334C7.00001 6.27247 7.42144 5.25506 8.17158 4.50491C8.92173 3.75477 9.93914 3.33334 11 3.33334C12.0609 3.33334 13.0783 3.75477 13.8284 4.50491C14.5786 5.25506 15 6.27247 15 7.33334V10H7.00001V7.33334ZM19 23.3333C19 23.687 18.8595 24.0261 18.6095 24.2761C18.3594 24.5262 18.0203 24.6667 17.6667 24.6667H4.33334C3.97972 24.6667 3.64058 24.5262 3.39053 24.2761C3.14049 24.0261 3.00001 23.687 3.00001 23.3333V14C3.00001 13.6464 3.14049 13.3072 3.39053 13.0572C3.64058 12.8071 3.97972 12.6667 4.33334 12.6667H17.6667C18.0203 12.6667 18.3594 12.8071 18.6095 13.0572C18.8595 13.3072 19 13.6464 19 14V23.3333Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file$2, 62, 20, 2862);
    			attr_dev(svg1, "width", "18");
    			attr_dev(svg1, "height", "23");
    			attr_dev(svg1, "viewBox", "0 0 22 28");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-15rf5nc");
    			add_location(svg1, file$2, 61, 16, 2746);
    			set_style(input1, "padding-right", "80px");
    			set_style(input1, "width", "calc(100% - 126px)");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "off");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-15rf5nc");
    			add_location(input1, file$2, 64, 16, 4723);
    			attr_dev(a0, "href", "/forgot-password");
    			attr_dev(a0, "class", "svelte-15rf5nc");
    			add_location(a0, file$2, 65, 16, 4945);
    			attr_dev(div1, "class", "inp svelte-15rf5nc");
    			add_location(div1, file$2, 60, 12, 2712);
    			attr_dev(div2, "class", "box col-xs-12");
    			add_location(div2, file$2, 51, 8, 1461);
    			attr_dev(div3, "class", "box form row middle-xs center-xs svelte-15rf5nc");
    			add_location(div3, file$2, 50, 4, 1406);
    			attr_dev(button, "class", "row middle-xs center-xs svelte-15rf5nc");
    			add_location(button, file$2, 70, 8, 5073);
    			attr_dev(a1, "href", "/signup");
    			attr_dev(a1, "class", "svelte-15rf5nc");
    			add_location(a1, file$2, 74, 35, 5271);
    			attr_dev(p, "class", "svelte-15rf5nc");
    			add_location(p, file$2, 73, 8, 5232);
    			attr_dev(div4, "class", "box btn svelte-15rf5nc");
    			add_location(div4, file$2, 69, 4, 5043);
    			attr_dev(div5, "class", "full svelte-15rf5nc");
    			add_location(div5, file$2, 49, 0, 1383);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$1.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t1);
    			append_dev(div2, t2);
    			append_dev(div2, h3);
    			append_dev(h3, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div1, t7);
    			append_dev(div1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(div1, t8);
    			append_dev(div1, a0);
    			append_dev(a0, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, button);
    			append_dev(button, t11);
    			append_dev(div4, t12);
    			append_dev(div4, p);
    			append_dev(p, t13);
    			append_dev(p, a1);
    			append_dev(a1, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "focus", /*focus_handler*/ ctx[4], false, false, false),
    					listen_dev(input0, "focusout", /*focusout_handler*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "focus", /*focus_handler_1*/ ctx[7], false, false, false),
    					listen_dev(input1, "focusout", /*focusout_handler_1*/ ctx[8], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					action_destroyer(link.call(null, a0)),
    					listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false),
    					action_destroyer(link.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
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

    function createRipple$1(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Signin", slots, []);
    	let email, password;

    	let signin = () => {
    		
    	}; // alert("Sorry, under construction !!!");

    	onMount(() => {
    		document.querySelector(".full").style.minHeight = document.querySelector(".full").offsetHeight + "px";
    	});

    	let t, elm;

    	let focusEv = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("svg");

    		if (elm.style.color == "rgb(255, 255, 255)") {
    			elm.style.color = "";
    		} else {
    			elm.style.color = "#fff";
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Signin> was created with unknown prop '${key}'`);
    	});

    	const focus_handler = e => focusEv(e);
    	const focusout_handler = e => focusEv(e);

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	const focus_handler_1 = e => focusEv(e);
    	const focusout_handler_1 = e => focusEv(e);

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	const click_handler = e => {
    		createRipple$1(e, "rgba(34, 145, 255, 0.2)");
    		signin();
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		link,
    		navigate,
    		email,
    		password,
    		signin,
    		t,
    		elm,
    		focusEv,
    		createRipple: createRipple$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("signin" in $$props) $$invalidate(2, signin = $$props.signin);
    		if ("t" in $$props) t = $$props.t;
    		if ("elm" in $$props) elm = $$props.elm;
    		if ("focusEv" in $$props) $$invalidate(3, focusEv = $$props.focusEv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		password,
    		signin,
    		focusEv,
    		focus_handler,
    		focusout_handler,
    		input0_input_handler,
    		focus_handler_1,
    		focusout_handler_1,
    		input1_input_handler,
    		click_handler
    	];
    }

    class Signin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Signin",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/user/Signup.svelte generated by Svelte v3.32.3 */

    const { document: document_1$2 } = globals;
    const file$3 = "src/pages/user/Signup.svelte";

    function create_fragment$5(ctx) {
    	let meta;
    	let t0;
    	let div7;
    	let div5;
    	let div4;
    	let h1;
    	let t1;
    	let t2;
    	let h3;
    	let t3;
    	let t4;
    	let div0;
    	let svg0;
    	let path0;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let svg1;
    	let path1;
    	let t7;
    	let input1;
    	let t8;
    	let div2;
    	let svg2;
    	let path2;
    	let t9;
    	let input2;
    	let t10;
    	let button0;
    	let svg3;
    	let path3;
    	let t11;
    	let div3;
    	let svg4;
    	let path4;
    	let t12;
    	let input3;
    	let t13;
    	let button1;
    	let svg5;
    	let path5;
    	let t14;
    	let div6;
    	let button2;
    	let t15;
    	let t16;
    	let p;
    	let t17;
    	let a;
    	let t18;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			div7 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			h1 = element("h1");
    			t1 = text("Nalara Store");
    			t2 = space();
    			h3 = element("h3");
    			t3 = text("Create Accoount");
    			t4 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			button0 = element("button");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t11 = space();
    			div3 = element("div");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			button1 = element("button");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t14 = space();
    			div6 = element("div");
    			button2 = element("button");
    			t15 = text("Sign up");
    			t16 = space();
    			p = element("p");
    			t17 = text("Already have an account? ");
    			a = element("a");
    			t18 = text("Sign in");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-186fcdx\"]", document_1$2.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div7 = claim_element(nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			div5 = claim_element(div7_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			h1 = claim_element(div4_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div4_nodes);
    			h3 = claim_element(div4_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t3 = claim_text(h3_nodes, "Create Accoount");
    			h3_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div0 = claim_element(div4_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			svg0 = claim_element(
    				div0_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);
    			path0 = claim_element(svg0_nodes, "path", { d: true, fill: true }, 1);
    			children(path0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			t5 = claim_space(div0_nodes);

    			input0 = claim_element(div0_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			svg1 = claim_element(
    				div1_nodes,
    				"svg",
    				{
    					style: true,
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);
    			path1 = claim_element(svg1_nodes, "path", { d: true, fill: true }, 1);
    			children(path1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);

    			input1 = claim_element(div1_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			div1_nodes.forEach(detach_dev);
    			t8 = claim_space(div4_nodes);
    			div2 = claim_element(div4_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			svg2 = claim_element(
    				div2_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg2_nodes = children(svg2);
    			path2 = claim_element(svg2_nodes, "path", { d: true, fill: true }, 1);
    			children(path2).forEach(detach_dev);
    			svg2_nodes.forEach(detach_dev);
    			t9 = claim_space(div2_nodes);

    			input2 = claim_element(div2_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			t10 = claim_space(div2_nodes);
    			button0 = claim_element(div2_nodes, "BUTTON", { type: true, class: true });
    			var button0_nodes = children(button0);
    			svg3 = claim_element(button0_nodes, "svg", { style: true, viewBox: true, class: true }, 1);
    			var svg3_nodes = children(svg3);
    			path3 = claim_element(svg3_nodes, "path", { fill: true, d: true }, 1);
    			children(path3).forEach(detach_dev);
    			svg3_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t11 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);

    			svg4 = claim_element(
    				div3_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg4_nodes = children(svg4);
    			path4 = claim_element(svg4_nodes, "path", { d: true, fill: true }, 1);
    			children(path4).forEach(detach_dev);
    			svg4_nodes.forEach(detach_dev);
    			t12 = claim_space(div3_nodes);

    			input3 = claim_element(div3_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			t13 = claim_space(div3_nodes);
    			button1 = claim_element(div3_nodes, "BUTTON", { type: true, class: true });
    			var button1_nodes = children(button1);
    			svg5 = claim_element(button1_nodes, "svg", { style: true, viewBox: true, class: true }, 1);
    			var svg5_nodes = children(svg5);
    			path5 = claim_element(svg5_nodes, "path", { fill: true, d: true }, 1);
    			children(path5).forEach(detach_dev);
    			svg5_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t14 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			button2 = claim_element(div6_nodes, "BUTTON", { class: true });
    			var button2_nodes = children(button2);
    			t15 = claim_text(button2_nodes, "Sign up");
    			button2_nodes.forEach(detach_dev);
    			t16 = claim_space(div6_nodes);
    			p = claim_element(div6_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t17 = claim_text(p_nodes, "Already have an account? ");
    			a = claim_element(p_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			t18 = claim_text(a_nodes, "Sign in");
    			a_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1$2.title = "Sign up - Nalara Store";
    			attr_dev(meta, "content", "#2291FF");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$3, 56, 4, 2457);
    			attr_dev(h1, "class", "svelte-1s7nqqe");
    			add_location(h1, file$3, 62, 12, 2635);
    			attr_dev(h3, "class", "svelte-1s7nqqe");
    			add_location(h3, file$3, 63, 12, 2669);
    			attr_dev(path0, "d", "M12 0.666664C8.324 0.666664 5.33333 3.65733 5.33333 7.33333C5.33333 11.0093 8.324 14 12 14C15.676 14 18.6667 11.0093 18.6667 7.33333C18.6667 3.65733 15.676 0.666664 12 0.666664ZM12 11.3333C9.79467 11.3333 8 9.53866 8 7.33333C8 5.128 9.79467 3.33333 12 3.33333C14.2053 3.33333 16 5.128 16 7.33333C16 9.53866 14.2053 11.3333 12 11.3333ZM24 26V24.6667C24 19.5213 19.812 15.3333 14.6667 15.3333H9.33333C4.18667 15.3333 0 19.5213 0 24.6667V26H2.66667V24.6667C2.66667 20.9907 5.65733 18 9.33333 18H14.6667C18.3427 18 21.3333 20.9907 21.3333 24.6667V26H24Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$3, 66, 20, 2858);
    			attr_dev(svg0, "width", "20");
    			attr_dev(svg0, "height", "21.5");
    			attr_dev(svg0, "viewBox", "0 0 24 26");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-1s7nqqe");
    			add_location(svg0, file$3, 65, 16, 2740);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "autocomplete", "off");
    			attr_dev(input0, "placeholder", "Full Name");
    			attr_dev(input0, "class", "svelte-1s7nqqe");
    			add_location(input0, file$3, 68, 16, 3483);
    			attr_dev(div0, "class", "inp svelte-1s7nqqe");
    			add_location(div0, file$3, 64, 12, 2706);
    			attr_dev(path1, "d", "M26.6667 0H1.77778C1.30628 0 0.854097 0.187301 0.520699 0.520699C0.187301 0.854097 0 1.30628 0 1.77778V19.5556C0 20.0271 0.187301 20.4792 0.520699 20.8126C0.854097 21.146 1.30628 21.3333 1.77778 21.3333H26.6667C27.1382 21.3333 27.5903 21.146 27.9237 20.8126C28.2571 20.4792 28.4444 20.0271 28.4444 19.5556V1.77778C28.4444 1.30628 28.2571 0.854097 27.9237 0.520699C27.5903 0.187301 27.1382 0 26.6667 0ZM25.2978 19.5556H3.25333L9.47555 13.12L8.19556 11.8844L1.77778 18.5244V3.12889L12.8267 14.1244C13.1598 14.4556 13.6103 14.6414 14.08 14.6414C14.5497 14.6414 15.0002 14.4556 15.3333 14.1244L26.6667 2.85333V18.4089L20.1244 11.8667L18.8711 13.12L25.2978 19.5556ZM2.94222 1.77778H25.2267L14.08 12.8622L2.94222 1.77778Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file$3, 72, 20, 3834);
    			set_style(svg1, "bottom", "18px");
    			attr_dev(svg1, "width", "22");
    			attr_dev(svg1, "height", "17");
    			attr_dev(svg1, "viewBox", "0 0 28 22");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-1s7nqqe");
    			add_location(svg1, file$3, 71, 16, 3698);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "autocomplete", "off");
    			attr_dev(input1, "placeholder", "Email Address");
    			attr_dev(input1, "class", "svelte-1s7nqqe");
    			add_location(input1, file$3, 74, 16, 4625);
    			attr_dev(div1, "class", "inp svelte-1s7nqqe");
    			add_location(div1, file$3, 70, 12, 3664);
    			attr_dev(path2, "d", "M11 15.3333C10.5941 15.3286 10.1964 15.4483 9.8606 15.6764C9.52477 15.9045 9.26687 16.23 9.12163 16.6091C8.97638 16.9882 8.95076 17.4027 9.04821 17.7968C9.14565 18.1908 9.3615 18.5456 9.66668 18.8133V20.6667C9.66668 21.0203 9.80715 21.3594 10.0572 21.6095C10.3072 21.8595 10.6464 22 11 22C11.3536 22 11.6928 21.8595 11.9428 21.6095C12.1929 21.3594 12.3333 21.0203 12.3333 20.6667V18.8133C12.6385 18.5456 12.8544 18.1908 12.9518 17.7968C13.0493 17.4027 13.0236 16.9882 12.8784 16.6091C12.7331 16.23 12.4753 15.9045 12.1394 15.6764C11.8036 15.4483 11.4059 15.3286 11 15.3333ZM17.6667 10V7.33334C17.6667 5.56523 16.9643 3.86954 15.7141 2.61929C14.4638 1.36905 12.7681 0.666672 11 0.666672C9.2319 0.666672 7.53621 1.36905 6.28596 2.61929C5.03572 3.86954 4.33334 5.56523 4.33334 7.33334V10C3.27248 10 2.25506 10.4214 1.50492 11.1716C0.754771 11.9217 0.333344 12.9391 0.333344 14V23.3333C0.333344 24.3942 0.754771 25.4116 1.50492 26.1618C2.25506 26.9119 3.27248 27.3333 4.33334 27.3333H17.6667C18.7275 27.3333 19.745 26.9119 20.4951 26.1618C21.2452 25.4116 21.6667 24.3942 21.6667 23.3333V14C21.6667 12.9391 21.2452 11.9217 20.4951 11.1716C19.745 10.4214 18.7275 10 17.6667 10ZM7.00001 7.33334C7.00001 6.27247 7.42144 5.25506 8.17158 4.50491C8.92173 3.75477 9.93914 3.33334 11 3.33334C12.0609 3.33334 13.0783 3.75477 13.8284 4.50491C14.5786 5.25506 15 6.27247 15 7.33334V10H7.00001V7.33334ZM19 23.3333C19 23.687 18.8595 24.0261 18.6095 24.2761C18.3594 24.5262 18.0203 24.6667 17.6667 24.6667H4.33334C3.97972 24.6667 3.64058 24.5262 3.39053 24.2761C3.14049 24.0261 3.00001 23.687 3.00001 23.3333V14C3.00001 13.6464 3.14049 13.3072 3.39053 13.0572C3.64058 12.8071 3.97972 12.6667 4.33334 12.6667H17.6667C18.0203 12.6667 18.3594 12.8071 18.6095 13.0572C18.8595 13.3072 19 13.6464 19 14V23.3333Z");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file$3, 78, 20, 4958);
    			attr_dev(svg2, "width", "18");
    			attr_dev(svg2, "height", "23");
    			attr_dev(svg2, "viewBox", "0 0 22 28");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "class", "svelte-1s7nqqe");
    			add_location(svg2, file$3, 77, 16, 4842);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "autocomplete", "off");
    			attr_dev(input2, "placeholder", "Password");
    			attr_dev(input2, "class", "svelte-1s7nqqe");
    			add_location(input2, file$3, 80, 16, 6819);
    			attr_dev(path3, "fill", "currentColor");
    			attr_dev(path3, "d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z");
    			add_location(path3, file$3, 83, 24, 7196);
    			set_style(svg3, "width", "24px");
    			set_style(svg3, "height", "24px");
    			set_style(svg3, "pointer-events", "none");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "class", "svelte-1s7nqqe");
    			add_location(svg3, file$3, 82, 20, 7095);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "row middle-xs center-xs svelte-1s7nqqe");
    			add_location(button0, file$3, 81, 16, 6988);
    			attr_dev(div2, "class", "inp svelte-1s7nqqe");
    			add_location(div2, file$3, 76, 12, 4808);
    			attr_dev(path4, "d", "M11 15.3333C10.5941 15.3286 10.1964 15.4483 9.8606 15.6764C9.52477 15.9045 9.26687 16.23 9.12163 16.6091C8.97638 16.9882 8.95076 17.4027 9.04821 17.7968C9.14565 18.1908 9.3615 18.5456 9.66668 18.8133V20.6667C9.66668 21.0203 9.80715 21.3594 10.0572 21.6095C10.3072 21.8595 10.6464 22 11 22C11.3536 22 11.6928 21.8595 11.9428 21.6095C12.1929 21.3594 12.3333 21.0203 12.3333 20.6667V18.8133C12.6385 18.5456 12.8544 18.1908 12.9518 17.7968C13.0493 17.4027 13.0236 16.9882 12.8784 16.6091C12.7331 16.23 12.4753 15.9045 12.1394 15.6764C11.8036 15.4483 11.4059 15.3286 11 15.3333ZM17.6667 10V7.33334C17.6667 5.56523 16.9643 3.86954 15.7141 2.61929C14.4638 1.36905 12.7681 0.666672 11 0.666672C9.2319 0.666672 7.53621 1.36905 6.28596 2.61929C5.03572 3.86954 4.33334 5.56523 4.33334 7.33334V10C3.27248 10 2.25506 10.4214 1.50492 11.1716C0.754771 11.9217 0.333344 12.9391 0.333344 14V23.3333C0.333344 24.3942 0.754771 25.4116 1.50492 26.1618C2.25506 26.9119 3.27248 27.3333 4.33334 27.3333H17.6667C18.7275 27.3333 19.745 26.9119 20.4951 26.1618C21.2452 25.4116 21.6667 24.3942 21.6667 23.3333V14C21.6667 12.9391 21.2452 11.9217 20.4951 11.1716C19.745 10.4214 18.7275 10 17.6667 10ZM7.00001 7.33334C7.00001 6.27247 7.42144 5.25506 8.17158 4.50491C8.92173 3.75477 9.93914 3.33334 11 3.33334C12.0609 3.33334 13.0783 3.75477 13.8284 4.50491C14.5786 5.25506 15 6.27247 15 7.33334V10H7.00001V7.33334ZM19 23.3333C19 23.687 18.8595 24.0261 18.6095 24.2761C18.3594 24.5262 18.0203 24.6667 17.6667 24.6667H4.33334C3.97972 24.6667 3.64058 24.5262 3.39053 24.2761C3.14049 24.0261 3.00001 23.687 3.00001 23.3333V14C3.00001 13.6464 3.14049 13.3072 3.39053 13.0572C3.64058 12.8071 3.97972 12.6667 4.33334 12.6667H17.6667C18.0203 12.6667 18.3594 12.8071 18.6095 13.0572C18.8595 13.3072 19 13.6464 19 14V23.3333Z");
    			attr_dev(path4, "fill", "currentColor");
    			add_location(path4, file$3, 89, 20, 8029);
    			attr_dev(svg4, "width", "18");
    			attr_dev(svg4, "height", "23");
    			attr_dev(svg4, "viewBox", "0 0 22 28");
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "class", "svelte-1s7nqqe");
    			add_location(svg4, file$3, 88, 16, 7913);
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "autocomplete", "off");
    			attr_dev(input3, "placeholder", "Password Confirmation");
    			attr_dev(input3, "class", "svelte-1s7nqqe");
    			add_location(input3, file$3, 91, 16, 9890);
    			attr_dev(path5, "fill", "currentColor");
    			attr_dev(path5, "d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z");
    			add_location(path5, file$3, 94, 24, 10292);
    			set_style(svg5, "width", "24px");
    			set_style(svg5, "height", "24px");
    			set_style(svg5, "pointer-events", "none");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			attr_dev(svg5, "class", "svelte-1s7nqqe");
    			add_location(svg5, file$3, 93, 20, 10191);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "row middle-xs center-xs svelte-1s7nqqe");
    			add_location(button1, file$3, 92, 16, 10084);
    			attr_dev(div3, "class", "inp svelte-1s7nqqe");
    			add_location(div3, file$3, 87, 12, 7879);
    			attr_dev(div4, "class", "box col-xs-12");
    			add_location(div4, file$3, 61, 8, 2595);
    			attr_dev(div5, "class", "box form row middle-xs center-xs svelte-1s7nqqe");
    			add_location(div5, file$3, 60, 4, 2540);
    			attr_dev(button2, "class", "row middle-xs center-xs svelte-1s7nqqe");
    			add_location(button2, file$3, 101, 8, 11023);
    			attr_dev(a, "href", "/signin");
    			attr_dev(a, "class", "svelte-1s7nqqe");
    			add_location(a, file$3, 105, 37, 11223);
    			attr_dev(p, "class", "svelte-1s7nqqe");
    			add_location(p, file$3, 104, 8, 11182);
    			attr_dev(div6, "class", "box btn svelte-1s7nqqe");
    			add_location(div6, file$3, 100, 4, 10993);
    			attr_dev(div7, "class", "full svelte-1s7nqqe");
    			add_location(div7, file$3, 59, 0, 2517);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$2.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div5);
    			append_dev(div5, div4);
    			append_dev(div4, h1);
    			append_dev(h1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, h3);
    			append_dev(h3, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*fullName*/ ctx[0]);
    			append_dev(div4, t6);
    			append_dev(div4, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div1, t7);
    			append_dev(div1, input1);
    			set_input_value(input1, /*email*/ ctx[1]);
    			append_dev(div4, t8);
    			append_dev(div4, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*password*/ ctx[2]);
    			append_dev(div2, t10);
    			append_dev(div2, button0);
    			append_dev(button0, svg3);
    			append_dev(svg3, path3);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, svg4);
    			append_dev(svg4, path4);
    			append_dev(div3, t12);
    			append_dev(div3, input3);
    			set_input_value(input3, /*passwordConfirmation*/ ctx[3]);
    			append_dev(div3, t13);
    			append_dev(div3, button1);
    			append_dev(button1, svg5);
    			append_dev(svg5, path5);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div6, button2);
    			append_dev(button2, t15);
    			append_dev(div6, t16);
    			append_dev(div6, p);
    			append_dev(p, t17);
    			append_dev(p, a);
    			append_dev(a, t18);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "focus", /*focus_handler*/ ctx[7], false, false, false),
    					listen_dev(input0, "focusout", /*focusout_handler*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "focus", /*focus_handler_1*/ ctx[10], false, false, false),
    					listen_dev(input1, "focusout", /*focusout_handler_1*/ ctx[11], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "focus", /*focus_handler_2*/ ctx[13], false, false, false),
    					listen_dev(input2, "focusout", /*focusout_handler_2*/ ctx[14], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[16], false, false, false),
    					listen_dev(input3, "focus", /*focus_handler_3*/ ctx[17], false, false, false),
    					listen_dev(input3, "focusout", /*focusout_handler_3*/ ctx[18], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[19]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[20], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[21], false, false, false),
    					action_destroyer(link.call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fullName*/ 1 && input0.value !== /*fullName*/ ctx[0]) {
    				set_input_value(input0, /*fullName*/ ctx[0]);
    			}

    			if (dirty & /*email*/ 2 && input1.value !== /*email*/ ctx[1]) {
    				set_input_value(input1, /*email*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input2.value !== /*password*/ ctx[2]) {
    				set_input_value(input2, /*password*/ ctx[2]);
    			}

    			if (dirty & /*passwordConfirmation*/ 8 && input3.value !== /*passwordConfirmation*/ ctx[3]) {
    				set_input_value(input3, /*passwordConfirmation*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
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

    function createRipple$2(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Signup", slots, []);
    	let fullName, email, password, passwordConfirmation;

    	let signup = () => {
    		
    	}; // alert("Sorry, under construction !!!")

    	let t, elm;

    	let focusEv = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("svg");

    		if (elm.style.color == "rgb(255, 255, 255)") {
    			elm.style.color = "";
    		} else {
    			elm.style.color = "#fff";
    		}
    	};

    	let togglePass = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("input");

    		if (elm.type == "password") {
    			t.querySelector("path").setAttribute("d", "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z");
    			elm.type = "text";
    		} else {
    			t.querySelector("path").setAttribute("d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"); // elm.focus();
    			elm.type = "password";
    		} // elm.focus();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Signup> was created with unknown prop '${key}'`);
    	});

    	const focus_handler = e => focusEv(e);
    	const focusout_handler = e => focusEv(e);

    	function input0_input_handler() {
    		fullName = this.value;
    		$$invalidate(0, fullName);
    	}

    	const focus_handler_1 = e => focusEv(e);
    	const focusout_handler_1 = e => focusEv(e);

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	const focus_handler_2 = e => focusEv(e);
    	const focusout_handler_2 = e => focusEv(e);

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	const click_handler = e => togglePass(e);
    	const focus_handler_3 = e => focusEv(e);
    	const focusout_handler_3 = e => focusEv(e);

    	function input3_input_handler() {
    		passwordConfirmation = this.value;
    		$$invalidate(3, passwordConfirmation);
    	}

    	const click_handler_1 = e => togglePass(e);

    	const click_handler_2 = e => {
    		createRipple$2(e, "rgba(34, 145, 255, 0.2)");
    		signup();
    	};

    	$$self.$capture_state = () => ({
    		link,
    		navigate,
    		fullName,
    		email,
    		password,
    		passwordConfirmation,
    		signup,
    		t,
    		elm,
    		focusEv,
    		togglePass,
    		createRipple: createRipple$2
    	});

    	$$self.$inject_state = $$props => {
    		if ("fullName" in $$props) $$invalidate(0, fullName = $$props.fullName);
    		if ("email" in $$props) $$invalidate(1, email = $$props.email);
    		if ("password" in $$props) $$invalidate(2, password = $$props.password);
    		if ("passwordConfirmation" in $$props) $$invalidate(3, passwordConfirmation = $$props.passwordConfirmation);
    		if ("signup" in $$props) $$invalidate(4, signup = $$props.signup);
    		if ("t" in $$props) t = $$props.t;
    		if ("elm" in $$props) elm = $$props.elm;
    		if ("focusEv" in $$props) $$invalidate(5, focusEv = $$props.focusEv);
    		if ("togglePass" in $$props) $$invalidate(6, togglePass = $$props.togglePass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fullName,
    		email,
    		password,
    		passwordConfirmation,
    		signup,
    		focusEv,
    		togglePass,
    		focus_handler,
    		focusout_handler,
    		input0_input_handler,
    		focus_handler_1,
    		focusout_handler_1,
    		input1_input_handler,
    		focus_handler_2,
    		focusout_handler_2,
    		input2_input_handler,
    		click_handler,
    		focus_handler_3,
    		focusout_handler_3,
    		input3_input_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Signup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Signup",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/user/ForgotPassword.svelte generated by Svelte v3.32.3 */

    const { document: document_1$3 } = globals;
    const file$4 = "src/pages/user/ForgotPassword.svelte";

    function create_fragment$6(ctx) {
    	let meta;
    	let t0;
    	let div4;
    	let div2;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let h3;
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let t6;
    	let div0;
    	let svg;
    	let path;
    	let t7;
    	let input;
    	let t8;
    	let div3;
    	let button;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text("Nalara Store");
    			t2 = space();
    			h3 = element("h3");
    			t3 = text("Password Recovery");
    			t4 = space();
    			p = element("p");
    			t5 = text("Enter your email to recover your password");
    			t6 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			div3 = element("div");
    			button = element("button");
    			t9 = text("Continue");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-1k2sb5v\"]", document_1$3.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div2 = claim_element(div4_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			h3 = claim_element(div1_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t3 = claim_text(h3_nodes, "Password Recovery");
    			h3_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			p = claim_element(div1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "Enter your email to recover your password");
    			p_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			svg = claim_element(
    				div0_nodes,
    				"svg",
    				{
    					style: true,
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			t7 = claim_space(div0_nodes);

    			input = claim_element(div0_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t8 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			button = claim_element(div3_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t9 = claim_text(button_nodes, "Continue");
    			button_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1$3.title = "Password Recovery - Nalara Store";
    			attr_dev(meta, "content", "#2291FF");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$4, 43, 4, 1212);
    			attr_dev(h1, "class", "svelte-11aqcj2");
    			add_location(h1, file$4, 49, 12, 1390);
    			attr_dev(h3, "class", "svelte-11aqcj2");
    			add_location(h3, file$4, 50, 12, 1424);
    			attr_dev(p, "class", "svelte-11aqcj2");
    			add_location(p, file$4, 51, 12, 1463);
    			attr_dev(path, "d", "M26.6667 0H1.77778C1.30628 0 0.854097 0.187301 0.520699 0.520699C0.187301 0.854097 0 1.30628 0 1.77778V19.5556C0 20.0271 0.187301 20.4792 0.520699 20.8126C0.854097 21.146 1.30628 21.3333 1.77778 21.3333H26.6667C27.1382 21.3333 27.5903 21.146 27.9237 20.8126C28.2571 20.4792 28.4444 20.0271 28.4444 19.5556V1.77778C28.4444 1.30628 28.2571 0.854097 27.9237 0.520699C27.5903 0.187301 27.1382 0 26.6667 0ZM25.2978 19.5556H3.25333L9.47555 13.12L8.19556 11.8844L1.77778 18.5244V3.12889L12.8267 14.1244C13.1598 14.4556 13.6103 14.6414 14.08 14.6414C14.5497 14.6414 15.0002 14.4556 15.3333 14.1244L26.6667 2.85333V18.4089L20.1244 11.8667L18.8711 13.12L25.2978 19.5556ZM2.94222 1.77778H25.2267L14.08 12.8622L2.94222 1.77778Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$4, 54, 20, 1694);
    			set_style(svg, "bottom", "18px");
    			attr_dev(svg, "width", "22");
    			attr_dev(svg, "height", "17");
    			attr_dev(svg, "viewBox", "0 0 28 22");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-11aqcj2");
    			add_location(svg, file$4, 53, 16, 1558);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "placeholder", "Email Address");
    			attr_dev(input, "class", "svelte-11aqcj2");
    			add_location(input, file$4, 56, 16, 2485);
    			attr_dev(div0, "class", "inp svelte-11aqcj2");
    			add_location(div0, file$4, 52, 12, 1524);
    			attr_dev(div1, "class", "box col-xs-12");
    			add_location(div1, file$4, 48, 8, 1350);
    			attr_dev(div2, "class", "box form row middle-xs center-xs svelte-11aqcj2");
    			add_location(div2, file$4, 47, 4, 1295);
    			attr_dev(button, "class", "row middle-xs center-xs svelte-11aqcj2");
    			add_location(button, file$4, 61, 8, 2716);
    			attr_dev(div3, "class", "box btn svelte-11aqcj2");
    			add_location(div3, file$4, 60, 4, 2686);
    			attr_dev(div4, "class", "full svelte-11aqcj2");
    			add_location(div4, file$4, 46, 0, 1272);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$3.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h3);
    			append_dev(h3, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div0, t7);
    			append_dev(div0, input);
    			set_input_value(input, /*email*/ ctx[0]);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "focus", /*focus_handler*/ ctx[3], false, false, false),
    					listen_dev(input, "focusout", /*focusout_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input.value !== /*email*/ ctx[0]) {
    				set_input_value(input, /*email*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createRipple$3(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ForgotPassword", slots, []);
    	let email, password;

    	let fPass = () => {
    		// alert("Sorry, under construction !!!");
    		navigate("/forgot-password/verification");
    	};

    	let t, elm;

    	let focusEv = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("svg");

    		if (elm.style.color == "rgb(255, 255, 255)") {
    			elm.style.color = "";
    		} else {
    			elm.style.color = "#fff";
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ForgotPassword> was created with unknown prop '${key}'`);
    	});

    	const focus_handler = e => focusEv(e);
    	const focusout_handler = e => focusEv(e);

    	function input_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	const click_handler = e => {
    		createRipple$3(e, "rgba(34, 145, 255, 0.2)");
    		fPass();
    	};

    	$$self.$capture_state = () => ({
    		link,
    		navigate,
    		email,
    		password,
    		fPass,
    		t,
    		elm,
    		focusEv,
    		createRipple: createRipple$3
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("password" in $$props) password = $$props.password;
    		if ("fPass" in $$props) $$invalidate(1, fPass = $$props.fPass);
    		if ("t" in $$props) t = $$props.t;
    		if ("elm" in $$props) elm = $$props.elm;
    		if ("focusEv" in $$props) $$invalidate(2, focusEv = $$props.focusEv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		fPass,
    		focusEv,
    		focus_handler,
    		focusout_handler,
    		input_input_handler,
    		click_handler
    	];
    }

    class ForgotPassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ForgotPassword",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/pages/user/VerPassword.svelte generated by Svelte v3.32.3 */

    const { document: document_1$4 } = globals;
    const file$5 = "src/pages/user/VerPassword.svelte";

    function create_fragment$7(ctx) {
    	let meta;
    	let style;
    	let t0;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let t3;
    	let h3;
    	let t4;
    	let t5;
    	let p;
    	let t6;
    	let br;
    	let t7;
    	let t8;
    	let div0;
    	let input0;
    	let t9;
    	let input1;
    	let t10;
    	let input2;
    	let t11;
    	let input3;
    	let t12;
    	let div3;
    	let button;
    	let t13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			style = element("style");
    			t0 = text("input::-webkit-outer-spin-button,\n        input::-webkit-inner-spin-button {\n            /* display: none; <- Crashes Chrome on hover */\n            -webkit-appearance: none;\n            margin: 0; /* <-- Apparently some margin are still there even though it's hidden */\n        }\n\n        input[type=number] {\n            -moz-appearance:textfield; /* Firefox */\n        }");
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t2 = text("Nalara Store");
    			t3 = space();
    			h3 = element("h3");
    			t4 = text("Verification");
    			t5 = space();
    			p = element("p");
    			t6 = text("We have sent a code to your email");
    			br = element("br");
    			t7 = text("nalara.art@gmail.com");
    			t8 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			input3 = element("input");
    			t12 = space();
    			div3 = element("div");
    			button = element("button");
    			t13 = text("Continue");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-n6wx\"]", document_1$4.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			style = claim_element(head_nodes, "STYLE", {});
    			var style_nodes = children(style);
    			t0 = claim_text(style_nodes, "input::-webkit-outer-spin-button,\n        input::-webkit-inner-spin-button {\n            /* display: none; <- Crashes Chrome on hover */\n            -webkit-appearance: none;\n            margin: 0; /* <-- Apparently some margin are still there even though it's hidden */\n        }\n\n        input[type=number] {\n            -moz-appearance:textfield; /* Firefox */\n        }");
    			style_nodes.forEach(detach_dev);
    			head_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div2 = claim_element(div4_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t2 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			h3 = claim_element(div1_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t4 = claim_text(h3_nodes, "Verification");
    			h3_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			p = claim_element(div1_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t6 = claim_text(p_nodes, "We have sent a code to your email");
    			br = claim_element(p_nodes, "BR", {});
    			t7 = claim_text(p_nodes, "nalara.art@gmail.com");
    			p_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			input0 = claim_element(div0_nodes, "INPUT", { type: true, class: true });
    			t9 = claim_space(div0_nodes);
    			input1 = claim_element(div0_nodes, "INPUT", { type: true, class: true, disabled: true });
    			t10 = claim_space(div0_nodes);
    			input2 = claim_element(div0_nodes, "INPUT", { type: true, class: true, disabled: true });
    			t11 = claim_space(div0_nodes);
    			input3 = claim_element(div0_nodes, "INPUT", { type: true, class: true, disabled: true });
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t12 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			button = claim_element(div3_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t13 = claim_text(button_nodes, "Continue");
    			button_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1$4.title = "Password Recovery Verification - Nalara Store";
    			attr_dev(meta, "content", "#2291FF");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$5, 115, 4, 3102);
    			add_location(style, file$5, 116, 4, 3150);
    			attr_dev(h1, "class", "svelte-jz0x0a");
    			add_location(h1, file$5, 133, 12, 3687);
    			attr_dev(h3, "class", "svelte-jz0x0a");
    			add_location(h3, file$5, 134, 12, 3721);
    			add_location(br, file$5, 135, 48, 3791);
    			attr_dev(p, "class", "svelte-jz0x0a");
    			add_location(p, file$5, 135, 12, 3755);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "col-xs svelte-jz0x0a");
    			add_location(input0, file$5, 137, 16, 3881);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "col-xs svelte-jz0x0a");
    			input1.disabled = true;
    			add_location(input1, file$5, 138, 16, 4016);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "col-xs svelte-jz0x0a");
    			input2.disabled = true;
    			add_location(input2, file$5, 139, 16, 4160);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "class", "col-xs svelte-jz0x0a");
    			input3.disabled = true;
    			add_location(input3, file$5, 140, 16, 4304);
    			attr_dev(div0, "class", "inp row between-xs svelte-jz0x0a");
    			add_location(div0, file$5, 136, 12, 3832);
    			attr_dev(div1, "class", "box col-xs-12");
    			add_location(div1, file$5, 132, 8, 3647);
    			attr_dev(div2, "class", "box form row middle-xs center-xs svelte-jz0x0a");
    			add_location(div2, file$5, 131, 4, 3592);
    			attr_dev(button, "class", "row middle-xs center-xs svelte-jz0x0a");
    			add_location(button, file$5, 145, 8, 4511);
    			attr_dev(div3, "class", "box btn svelte-jz0x0a");
    			add_location(div3, file$5, 144, 4, 4481);
    			attr_dev(div4, "class", "full svelte-jz0x0a");
    			add_location(div4, file$5, 130, 0, 3569);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$4.head, meta);
    			append_dev(document_1$4.head, style);
    			append_dev(style, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, h3);
    			append_dev(h3, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p);
    			append_dev(p, t6);
    			append_dev(p, br);
    			append_dev(p, t7);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			/*input0_binding*/ ctx[17](input0);
    			set_input_value(input0, /*i1*/ ctx[4]);
    			append_dev(div0, t9);
    			append_dev(div0, input1);
    			/*input1_binding*/ ctx[20](input1);
    			set_input_value(input1, /*i2*/ ctx[5]);
    			append_dev(div0, t10);
    			append_dev(div0, input2);
    			/*input2_binding*/ ctx[23](input2);
    			set_input_value(input2, /*i3*/ ctx[6]);
    			append_dev(div0, t11);
    			append_dev(div0, input3);
    			/*input3_binding*/ ctx[26](input3);
    			set_input_value(input3, /*i4*/ ctx[7]);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[18]),
    					listen_dev(input0, "input", /*in1*/ ctx[9], false, false, false),
    					listen_dev(input0, "keydown", /*keydown_handler*/ ctx[19], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[21]),
    					listen_dev(input1, "input", /*in2*/ ctx[10], false, false, false),
    					listen_dev(input1, "keydown", /*keydown_handler_1*/ ctx[22], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[24]),
    					listen_dev(input2, "input", /*in3*/ ctx[11], false, false, false),
    					listen_dev(input2, "keydown", /*keydown_handler_2*/ ctx[25], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[27]),
    					listen_dev(input3, "input", /*in4*/ ctx[12], false, false, false),
    					listen_dev(input3, "keydown", /*keydown_handler_3*/ ctx[28], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*i1*/ 16 && to_number(input0.value) !== /*i1*/ ctx[4]) {
    				set_input_value(input0, /*i1*/ ctx[4]);
    			}

    			if (dirty & /*i2*/ 32 && to_number(input1.value) !== /*i2*/ ctx[5]) {
    				set_input_value(input1, /*i2*/ ctx[5]);
    			}

    			if (dirty & /*i3*/ 64 && to_number(input2.value) !== /*i3*/ ctx[6]) {
    				set_input_value(input2, /*i3*/ ctx[6]);
    			}

    			if (dirty & /*i4*/ 128 && to_number(input3.value) !== /*i4*/ ctx[7]) {
    				set_input_value(input3, /*i4*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			detach_dev(style);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			/*input0_binding*/ ctx[17](null);
    			/*input1_binding*/ ctx[20](null);
    			/*input2_binding*/ ctx[23](null);
    			/*input3_binding*/ ctx[26](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createRipple$4(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VerPassword", slots, []);
    	let inp1, inp2, inp3, inp4;
    	let i1, i2, i3, i4;

    	let verify = () => {
    		navigate("/reset-password/kodepanjang");
    	}; // alert("Sorry, under construction !!!");

    	let in1 = () => {
    		if (i1 == null) {
    			$$invalidate(4, i1 = "");
    			inp1.focus();
    		} else if (i1 > 9) {
    			$$invalidate(4, i1 = parseInt(i1.toString().slice(0, -1)));
    		} else if (i1 != null) {
    			$$invalidate(0, inp1.disabled = true, inp1);
    			$$invalidate(1, inp2.disabled = false, inp2);
    			inp2.focus();
    		}
    	};

    	let in2 = () => {
    		if (i2 == null) {
    			$$invalidate(5, i2 = "");
    			inp2.focus();
    		} else if (i2 > 9) {
    			$$invalidate(5, i2 = parseInt(i2.toString().slice(0, -1)));
    		} else if (i2 != null) {
    			$$invalidate(1, inp2.disabled = true, inp2);
    			$$invalidate(2, inp3.disabled = false, inp3);
    			inp3.focus();
    		}
    	};

    	let in3 = () => {
    		if (i3 == null) {
    			$$invalidate(6, i3 = "");
    			inp3.focus();
    		} else if (i3 > 9) {
    			$$invalidate(6, i3 = parseInt(i3.toString().slice(0, -1)));
    		} else if (i3 != null) {
    			$$invalidate(2, inp3.disabled = true, inp3);
    			$$invalidate(3, inp4.disabled = false, inp4);
    			inp4.focus();
    		}
    	};

    	let in4 = () => {
    		if (i4 == null) {
    			$$invalidate(7, i4 = "");
    			inp4.focus();
    		} else if (i4 > 9) {
    			$$invalidate(7, i4 = parseInt(i4.toString().slice(0, -1)));
    		}
    	};

    	let key;

    	let din1 = e => {
    		key = e.keyCode || e.charCode;
    	};

    	let din2 = e => {
    		key = e.keyCode || e.charCode;

    		if (key === 8 || key === 46) {
    			if (i2 == null || i2 == "") {
    				$$invalidate(0, inp1.disabled = false, inp1);
    				$$invalidate(1, inp2.disabled = true, inp2);
    				inp1.focus();
    			}
    		}
    	};

    	let din3 = e => {
    		key = e.keyCode || e.charCode;

    		if (key === 8 || key === 46) {
    			if (i3 == null || i3 == "") {
    				$$invalidate(1, inp2.disabled = false, inp2);
    				$$invalidate(2, inp3.disabled = true, inp3);
    				inp2.focus();
    			}
    		}
    	};

    	let din4 = e => {
    		key = e.keyCode || e.charCode;

    		if (key === 8 || key === 46) {
    			if (i4 == null || i4 == "") {
    				$$invalidate(2, inp3.disabled = false, inp3);
    				$$invalidate(3, inp4.disabled = true, inp4);
    				inp3.focus();
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VerPassword> was created with unknown prop '${key}'`);
    	});

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inp1 = $$value;
    			$$invalidate(0, inp1);
    		});
    	}

    	function input0_input_handler() {
    		i1 = to_number(this.value);
    		$$invalidate(4, i1);
    	}

    	const keydown_handler = e => din1(e);

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inp2 = $$value;
    			$$invalidate(1, inp2);
    		});
    	}

    	function input1_input_handler() {
    		i2 = to_number(this.value);
    		$$invalidate(5, i2);
    	}

    	const keydown_handler_1 = e => din2(e);

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inp3 = $$value;
    			$$invalidate(2, inp3);
    		});
    	}

    	function input2_input_handler() {
    		i3 = to_number(this.value);
    		$$invalidate(6, i3);
    	}

    	const keydown_handler_2 = e => din3(e);

    	function input3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inp4 = $$value;
    			$$invalidate(3, inp4);
    		});
    	}

    	function input3_input_handler() {
    		i4 = to_number(this.value);
    		$$invalidate(7, i4);
    	}

    	const keydown_handler_3 = e => din4(e);

    	const click_handler = e => {
    		createRipple$4(e, "rgba(34, 145, 255, 0.2)");
    		verify();
    	};

    	$$self.$capture_state = () => ({
    		link,
    		navigate,
    		inp1,
    		inp2,
    		inp3,
    		inp4,
    		i1,
    		i2,
    		i3,
    		i4,
    		verify,
    		in1,
    		in2,
    		in3,
    		in4,
    		key,
    		din1,
    		din2,
    		din3,
    		din4,
    		createRipple: createRipple$4
    	});

    	$$self.$inject_state = $$props => {
    		if ("inp1" in $$props) $$invalidate(0, inp1 = $$props.inp1);
    		if ("inp2" in $$props) $$invalidate(1, inp2 = $$props.inp2);
    		if ("inp3" in $$props) $$invalidate(2, inp3 = $$props.inp3);
    		if ("inp4" in $$props) $$invalidate(3, inp4 = $$props.inp4);
    		if ("i1" in $$props) $$invalidate(4, i1 = $$props.i1);
    		if ("i2" in $$props) $$invalidate(5, i2 = $$props.i2);
    		if ("i3" in $$props) $$invalidate(6, i3 = $$props.i3);
    		if ("i4" in $$props) $$invalidate(7, i4 = $$props.i4);
    		if ("verify" in $$props) $$invalidate(8, verify = $$props.verify);
    		if ("in1" in $$props) $$invalidate(9, in1 = $$props.in1);
    		if ("in2" in $$props) $$invalidate(10, in2 = $$props.in2);
    		if ("in3" in $$props) $$invalidate(11, in3 = $$props.in3);
    		if ("in4" in $$props) $$invalidate(12, in4 = $$props.in4);
    		if ("key" in $$props) key = $$props.key;
    		if ("din1" in $$props) $$invalidate(13, din1 = $$props.din1);
    		if ("din2" in $$props) $$invalidate(14, din2 = $$props.din2);
    		if ("din3" in $$props) $$invalidate(15, din3 = $$props.din3);
    		if ("din4" in $$props) $$invalidate(16, din4 = $$props.din4);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		inp1,
    		inp2,
    		inp3,
    		inp4,
    		i1,
    		i2,
    		i3,
    		i4,
    		verify,
    		in1,
    		in2,
    		in3,
    		in4,
    		din1,
    		din2,
    		din3,
    		din4,
    		input0_binding,
    		input0_input_handler,
    		keydown_handler,
    		input1_binding,
    		input1_input_handler,
    		keydown_handler_1,
    		input2_binding,
    		input2_input_handler,
    		keydown_handler_2,
    		input3_binding,
    		input3_input_handler,
    		keydown_handler_3,
    		click_handler
    	];
    }

    class VerPassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VerPassword",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/user/ResetPassword.svelte generated by Svelte v3.32.3 */

    const { document: document_1$5 } = globals;
    const file$6 = "src/pages/user/ResetPassword.svelte";

    function create_fragment$8(ctx) {
    	let meta;
    	let t0;
    	let div5;
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let t2;
    	let h3;
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let t6;
    	let div0;
    	let svg0;
    	let path0;
    	let t7;
    	let input0;
    	let t8;
    	let button0;
    	let svg1;
    	let path1;
    	let t9;
    	let div1;
    	let svg2;
    	let path2;
    	let t10;
    	let input1;
    	let t11;
    	let button1;
    	let svg3;
    	let path3;
    	let t12;
    	let div4;
    	let button2;
    	let t13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			t1 = text("Nalara Store");
    			t2 = space();
    			h3 = element("h3");
    			t3 = text("Reset Password");
    			t4 = space();
    			p = element("p");
    			t5 = text("At least 8 characters with uppercase, lowercase, number and symbol");
    			t6 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			button0 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t9 = space();
    			div1 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			button1 = element("button");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t12 = space();
    			div4 = element("div");
    			button2 = element("button");
    			t13 = text("Continue");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-1bpjqzb\"]", document_1$5.head);
    			meta = claim_element(head_nodes, "META", { content: true, name: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div5 = claim_element(nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			h1 = claim_element(div2_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Nalara Store");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			h3 = claim_element(div2_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t3 = claim_text(h3_nodes, "Reset Password");
    			h3_nodes.forEach(detach_dev);
    			t4 = claim_space(div2_nodes);
    			p = claim_element(div2_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "At least 8 characters with uppercase, lowercase, number and symbol");
    			p_nodes.forEach(detach_dev);
    			t6 = claim_space(div2_nodes);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			svg0 = claim_element(
    				div0_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);
    			path0 = claim_element(svg0_nodes, "path", { d: true, fill: true }, 1);
    			children(path0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			t7 = claim_space(div0_nodes);

    			input0 = claim_element(div0_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			t8 = claim_space(div0_nodes);
    			button0 = claim_element(div0_nodes, "BUTTON", { type: true, class: true });
    			var button0_nodes = children(button0);
    			svg1 = claim_element(button0_nodes, "svg", { style: true, viewBox: true, class: true }, 1);
    			var svg1_nodes = children(svg1);
    			path1 = claim_element(svg1_nodes, "path", { fill: true, d: true }, 1);
    			children(path1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t9 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			svg2 = claim_element(
    				div1_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true,
    					class: true
    				},
    				1
    			);

    			var svg2_nodes = children(svg2);
    			path2 = claim_element(svg2_nodes, "path", { d: true, fill: true }, 1);
    			children(path2).forEach(detach_dev);
    			svg2_nodes.forEach(detach_dev);
    			t10 = claim_space(div1_nodes);

    			input1 = claim_element(div1_nodes, "INPUT", {
    				type: true,
    				autocomplete: true,
    				placeholder: true,
    				class: true
    			});

    			t11 = claim_space(div1_nodes);
    			button1 = claim_element(div1_nodes, "BUTTON", { type: true, class: true });
    			var button1_nodes = children(button1);
    			svg3 = claim_element(button1_nodes, "svg", { style: true, viewBox: true, class: true }, 1);
    			var svg3_nodes = children(svg3);
    			path3 = claim_element(svg3_nodes, "path", { fill: true, d: true }, 1);
    			children(path3).forEach(detach_dev);
    			svg3_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t12 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			button2 = claim_element(div4_nodes, "BUTTON", { class: true });
    			var button2_nodes = children(button2);
    			t13 = claim_text(button2_nodes, "Continue");
    			button2_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document_1$5.title = "Reset Password - Nalara Store";
    			attr_dev(meta, "content", "#2291FF");
    			attr_dev(meta, "name", "theme-color");
    			add_location(meta, file$6, 57, 4, 2457);
    			attr_dev(h1, "class", "svelte-s5z7d9");
    			add_location(h1, file$6, 63, 12, 2635);
    			attr_dev(h3, "class", "svelte-s5z7d9");
    			add_location(h3, file$6, 64, 12, 2669);
    			attr_dev(p, "class", "svelte-s5z7d9");
    			add_location(p, file$6, 65, 12, 2705);
    			attr_dev(path0, "d", "M11 15.3333C10.5941 15.3286 10.1964 15.4483 9.8606 15.6764C9.52477 15.9045 9.26687 16.23 9.12163 16.6091C8.97638 16.9882 8.95076 17.4027 9.04821 17.7968C9.14565 18.1908 9.3615 18.5456 9.66668 18.8133V20.6667C9.66668 21.0203 9.80715 21.3594 10.0572 21.6095C10.3072 21.8595 10.6464 22 11 22C11.3536 22 11.6928 21.8595 11.9428 21.6095C12.1929 21.3594 12.3333 21.0203 12.3333 20.6667V18.8133C12.6385 18.5456 12.8544 18.1908 12.9518 17.7968C13.0493 17.4027 13.0236 16.9882 12.8784 16.6091C12.7331 16.23 12.4753 15.9045 12.1394 15.6764C11.8036 15.4483 11.4059 15.3286 11 15.3333ZM17.6667 10V7.33334C17.6667 5.56523 16.9643 3.86954 15.7141 2.61929C14.4638 1.36905 12.7681 0.666672 11 0.666672C9.2319 0.666672 7.53621 1.36905 6.28596 2.61929C5.03572 3.86954 4.33334 5.56523 4.33334 7.33334V10C3.27248 10 2.25506 10.4214 1.50492 11.1716C0.754771 11.9217 0.333344 12.9391 0.333344 14V23.3333C0.333344 24.3942 0.754771 25.4116 1.50492 26.1618C2.25506 26.9119 3.27248 27.3333 4.33334 27.3333H17.6667C18.7275 27.3333 19.745 26.9119 20.4951 26.1618C21.2452 25.4116 21.6667 24.3942 21.6667 23.3333V14C21.6667 12.9391 21.2452 11.9217 20.4951 11.1716C19.745 10.4214 18.7275 10 17.6667 10ZM7.00001 7.33334C7.00001 6.27247 7.42144 5.25506 8.17158 4.50491C8.92173 3.75477 9.93914 3.33334 11 3.33334C12.0609 3.33334 13.0783 3.75477 13.8284 4.50491C14.5786 5.25506 15 6.27247 15 7.33334V10H7.00001V7.33334ZM19 23.3333C19 23.687 18.8595 24.0261 18.6095 24.2761C18.3594 24.5262 18.0203 24.6667 17.6667 24.6667H4.33334C3.97972 24.6667 3.64058 24.5262 3.39053 24.2761C3.14049 24.0261 3.00001 23.687 3.00001 23.3333V14C3.00001 13.6464 3.14049 13.3072 3.39053 13.0572C3.64058 12.8071 3.97972 12.6667 4.33334 12.6667H17.6667C18.0203 12.6667 18.3594 12.8071 18.6095 13.0572C18.8595 13.3072 19 13.6464 19 14V23.3333Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$6, 68, 20, 2941);
    			attr_dev(svg0, "width", "18");
    			attr_dev(svg0, "height", "23");
    			attr_dev(svg0, "viewBox", "0 0 22 28");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-s5z7d9");
    			add_location(svg0, file$6, 67, 16, 2825);
    			attr_dev(input0, "type", "password");
    			attr_dev(input0, "autocomplete", "off");
    			attr_dev(input0, "placeholder", "Password");
    			attr_dev(input0, "class", "svelte-s5z7d9");
    			add_location(input0, file$6, 70, 16, 4802);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z");
    			add_location(path1, file$6, 73, 24, 5179);
    			set_style(svg1, "width", "24px");
    			set_style(svg1, "height", "24px");
    			set_style(svg1, "pointer-events", "none");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "class", "svelte-s5z7d9");
    			add_location(svg1, file$6, 72, 20, 5078);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "row middle-xs center-xs svelte-s5z7d9");
    			add_location(button0, file$6, 71, 16, 4971);
    			attr_dev(div0, "class", "inp svelte-s5z7d9");
    			add_location(div0, file$6, 66, 12, 2791);
    			attr_dev(path2, "d", "M11 15.3333C10.5941 15.3286 10.1964 15.4483 9.8606 15.6764C9.52477 15.9045 9.26687 16.23 9.12163 16.6091C8.97638 16.9882 8.95076 17.4027 9.04821 17.7968C9.14565 18.1908 9.3615 18.5456 9.66668 18.8133V20.6667C9.66668 21.0203 9.80715 21.3594 10.0572 21.6095C10.3072 21.8595 10.6464 22 11 22C11.3536 22 11.6928 21.8595 11.9428 21.6095C12.1929 21.3594 12.3333 21.0203 12.3333 20.6667V18.8133C12.6385 18.5456 12.8544 18.1908 12.9518 17.7968C13.0493 17.4027 13.0236 16.9882 12.8784 16.6091C12.7331 16.23 12.4753 15.9045 12.1394 15.6764C11.8036 15.4483 11.4059 15.3286 11 15.3333ZM17.6667 10V7.33334C17.6667 5.56523 16.9643 3.86954 15.7141 2.61929C14.4638 1.36905 12.7681 0.666672 11 0.666672C9.2319 0.666672 7.53621 1.36905 6.28596 2.61929C5.03572 3.86954 4.33334 5.56523 4.33334 7.33334V10C3.27248 10 2.25506 10.4214 1.50492 11.1716C0.754771 11.9217 0.333344 12.9391 0.333344 14V23.3333C0.333344 24.3942 0.754771 25.4116 1.50492 26.1618C2.25506 26.9119 3.27248 27.3333 4.33334 27.3333H17.6667C18.7275 27.3333 19.745 26.9119 20.4951 26.1618C21.2452 25.4116 21.6667 24.3942 21.6667 23.3333V14C21.6667 12.9391 21.2452 11.9217 20.4951 11.1716C19.745 10.4214 18.7275 10 17.6667 10ZM7.00001 7.33334C7.00001 6.27247 7.42144 5.25506 8.17158 4.50491C8.92173 3.75477 9.93914 3.33334 11 3.33334C12.0609 3.33334 13.0783 3.75477 13.8284 4.50491C14.5786 5.25506 15 6.27247 15 7.33334V10H7.00001V7.33334ZM19 23.3333C19 23.687 18.8595 24.0261 18.6095 24.2761C18.3594 24.5262 18.0203 24.6667 17.6667 24.6667H4.33334C3.97972 24.6667 3.64058 24.5262 3.39053 24.2761C3.14049 24.0261 3.00001 23.687 3.00001 23.3333V14C3.00001 13.6464 3.14049 13.3072 3.39053 13.0572C3.64058 12.8071 3.97972 12.6667 4.33334 12.6667H17.6667C18.0203 12.6667 18.3594 12.8071 18.6095 13.0572C18.8595 13.3072 19 13.6464 19 14V23.3333Z");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file$6, 79, 20, 6012);
    			attr_dev(svg2, "width", "18");
    			attr_dev(svg2, "height", "23");
    			attr_dev(svg2, "viewBox", "0 0 22 28");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "class", "svelte-s5z7d9");
    			add_location(svg2, file$6, 78, 16, 5896);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "off");
    			attr_dev(input1, "placeholder", "Password Confirmation");
    			attr_dev(input1, "class", "svelte-s5z7d9");
    			add_location(input1, file$6, 81, 16, 7873);
    			attr_dev(path3, "fill", "currentColor");
    			attr_dev(path3, "d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z");
    			add_location(path3, file$6, 84, 24, 8275);
    			set_style(svg3, "width", "24px");
    			set_style(svg3, "height", "24px");
    			set_style(svg3, "pointer-events", "none");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			attr_dev(svg3, "class", "svelte-s5z7d9");
    			add_location(svg3, file$6, 83, 20, 8174);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "row middle-xs center-xs svelte-s5z7d9");
    			add_location(button1, file$6, 82, 16, 8067);
    			attr_dev(div1, "class", "inp svelte-s5z7d9");
    			add_location(div1, file$6, 77, 12, 5862);
    			attr_dev(div2, "class", "box col-xs-12");
    			add_location(div2, file$6, 62, 8, 2595);
    			attr_dev(div3, "class", "box form row middle-xs center-xs svelte-s5z7d9");
    			add_location(div3, file$6, 61, 4, 2540);
    			attr_dev(button2, "class", "row middle-xs center-xs svelte-s5z7d9");
    			add_location(button2, file$6, 91, 8, 9006);
    			attr_dev(div4, "class", "box btn svelte-s5z7d9");
    			add_location(div4, file$6, 90, 4, 8976);
    			attr_dev(div5, "class", "full svelte-s5z7d9");
    			add_location(div5, file$6, 60, 0, 2517);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$5.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t1);
    			append_dev(div2, t2);
    			append_dev(div2, h3);
    			append_dev(h3, t3);
    			append_dev(div2, t4);
    			append_dev(div2, p);
    			append_dev(p, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t7);
    			append_dev(div0, input0);
    			set_input_value(input0, /*password*/ ctx[0]);
    			append_dev(div0, t8);
    			append_dev(div0, button0);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, svg2);
    			append_dev(svg2, path2);
    			append_dev(div1, t10);
    			append_dev(div1, input1);
    			set_input_value(input1, /*passwordConfirmation*/ ctx[1]);
    			append_dev(div1, t11);
    			append_dev(div1, button1);
    			append_dev(button1, svg3);
    			append_dev(svg3, path3);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, button2);
    			append_dev(button2, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "focus", /*focus_handler*/ ctx[5], false, false, false),
    					listen_dev(input0, "focusout", /*focusout_handler*/ ctx[6], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(input1, "focus", /*focus_handler_1*/ ctx[9], false, false, false),
    					listen_dev(input1, "focusout", /*focusout_handler_1*/ ctx[10], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[12], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*password*/ 1 && input0.value !== /*password*/ ctx[0]) {
    				set_input_value(input0, /*password*/ ctx[0]);
    			}

    			if (dirty & /*passwordConfirmation*/ 2 && input1.value !== /*passwordConfirmation*/ ctx[1]) {
    				set_input_value(input1, /*passwordConfirmation*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createRipple$5(event, color) {
    	const button = event.currentTarget;
    	const pos = button.getBoundingClientRect();
    	const circle = document.createElement("span");
    	circle.style.background = color;
    	circle.style.top = event.clientY - (button.offsetHeight / 2 + pos.top) - 124 + "px";
    	circle.style.left = event.clientX - (button.offsetWidth / 2 + pos.left) + "px";
    	circle.classList.add("ripple");
    	const ripple = button.getElementsByClassName("ripple")[0];

    	if (ripple) {
    		ripple.remove();
    	}

    	button.appendChild(circle);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResetPassword", slots, []);
    	let password, passwordConfirmation;

    	let resetPassword = () => {
    		
    	}; // alert("Sorry, under construction !!!");

    	let t, elm;

    	let focusEv = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("svg");

    		if (elm.style.color == "rgb(255, 255, 255)") {
    			elm.style.color = "";
    		} else {
    			elm.style.color = "#fff";
    		}
    	};

    	let togglePass = e => {
    		t = e.target;
    		elm = t.parentNode.querySelector("input");

    		if (elm.type == "password") {
    			t.querySelector("path").setAttribute("d", "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z");
    			elm.type = "text";
    		} else {
    			t.querySelector("path").setAttribute("d", "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"); // elm.focus();
    			elm.type = "password";
    		} // elm.focus();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResetPassword> was created with unknown prop '${key}'`);
    	});

    	const focus_handler = e => focusEv(e);
    	const focusout_handler = e => focusEv(e);

    	function input0_input_handler() {
    		password = this.value;
    		$$invalidate(0, password);
    	}

    	const click_handler = e => togglePass(e);
    	const focus_handler_1 = e => focusEv(e);
    	const focusout_handler_1 = e => focusEv(e);

    	function input1_input_handler() {
    		passwordConfirmation = this.value;
    		$$invalidate(1, passwordConfirmation);
    	}

    	const click_handler_1 = e => togglePass(e);

    	const click_handler_2 = e => {
    		createRipple$5(e, "rgba(34, 145, 255, 0.2)");
    		resetPassword();
    	};

    	$$self.$capture_state = () => ({
    		link,
    		navigate,
    		password,
    		passwordConfirmation,
    		resetPassword,
    		t,
    		elm,
    		focusEv,
    		togglePass,
    		createRipple: createRipple$5
    	});

    	$$self.$inject_state = $$props => {
    		if ("password" in $$props) $$invalidate(0, password = $$props.password);
    		if ("passwordConfirmation" in $$props) $$invalidate(1, passwordConfirmation = $$props.passwordConfirmation);
    		if ("resetPassword" in $$props) $$invalidate(2, resetPassword = $$props.resetPassword);
    		if ("t" in $$props) t = $$props.t;
    		if ("elm" in $$props) elm = $$props.elm;
    		if ("focusEv" in $$props) $$invalidate(3, focusEv = $$props.focusEv);
    		if ("togglePass" in $$props) $$invalidate(4, togglePass = $$props.togglePass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		password,
    		passwordConfirmation,
    		resetPassword,
    		focusEv,
    		togglePass,
    		focus_handler,
    		focusout_handler,
    		input0_input_handler,
    		click_handler,
    		focus_handler_1,
    		focusout_handler_1,
    		input1_input_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ResetPassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResetPassword",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.32.3 */

    const file$7 = "src/components/Header.svelte";

    function create_fragment$9(ctx) {
    	let header;
    	let button0;
    	let svg0;
    	let path0;
    	let path1;
    	let t0;
    	let button1;
    	let svg1;
    	let path2;
    	let t1;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			header = element("header");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			t1 = space();
    			span = element("span");
    			t2 = text("99+");
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			button0 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);

    			svg0 = claim_element(
    				button0_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);

    			path0 = claim_element(
    				svg0_nodes,
    				"path",
    				{
    					d: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path0).forEach(detach_dev);

    			path1 = claim_element(
    				svg0_nodes,
    				"path",
    				{
    					d: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			t0 = claim_space(header_nodes);
    			button1 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);

    			svg1 = claim_element(
    				button1_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);
    			path2 = claim_element(svg1_nodes, "path", { d: true, fill: true }, 1);
    			children(path2).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			t1 = claim_space(button1_nodes);
    			span = claim_element(button1_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t2 = claim_text(span_nodes, "99+");
    			span_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path0, "d", "M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26Z");
    			attr_dev(path0, "stroke", "black");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$7, 7, 12, 224);
    			attr_dev(path1, "d", "M23 23L30 30");
    			attr_dev(path1, "stroke", "black");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			add_location(path1, file$7, 8, 12, 442);
    			attr_dev(svg0, "width", "32");
    			attr_dev(svg0, "height", "32");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$7, 6, 8, 116);
    			attr_dev(button0, "class", "row middle-xs center-xs svelte-1qz8aav");
    			add_location(button0, file$7, 5, 4, 67);
    			attr_dev(path2, "d", "M14 32.0009C15.0609 32.0009 16.0783 31.5795 16.8284 30.8293C17.5786 30.0792 18 29.0618 18 28.0009H10C10 29.0618 10.4214 30.0792 11.1716 30.8293C11.9217 31.5795 12.9391 32.0009 14 32.0009ZM14 3.8369L12.406 4.1589C10.5979 4.5273 8.97266 5.5091 7.8053 6.93814C6.63795 8.36718 6.0002 10.1557 6 12.0009C6 13.2569 5.732 16.3949 5.082 19.4849C4.762 21.0189 4.33 22.6169 3.756 24.0009H24.244C23.67 22.6169 23.24 21.0209 22.918 19.4849C22.268 16.3949 22 13.2569 22 12.0009C21.9993 10.156 21.3614 8.36799 20.1941 6.93937C19.0267 5.51074 17.4017 4.52923 15.594 4.1609L14 3.8349V3.8369ZM26.44 24.0009C26.886 24.8949 27.402 25.6029 28 26.0009H0C0.598 25.6029 1.114 24.8949 1.56 24.0009C3.36 20.4009 4 13.7609 4 12.0009C4 7.1609 7.44 3.1209 12.01 2.1989C11.9821 1.9208 12.0128 1.63995 12.1001 1.37444C12.1874 1.10894 12.3293 0.864675 12.5168 0.657412C12.7043 0.450148 12.9332 0.284485 13.1887 0.171104C13.4441 0.0577245 13.7205 -0.000854492 14 -0.000854492C14.2795 -0.000854492 14.5559 0.0577245 14.8113 0.171104C15.0668 0.284485 15.2957 0.450148 15.4832 0.657412C15.6707 0.864675 15.8126 1.10894 15.8999 1.37444C15.9872 1.63995 16.0179 1.9208 15.99 2.1989C18.2506 2.6587 20.2828 3.88562 21.7425 5.6719C23.2022 7.45818 23.9997 9.69404 24 12.0009C24 13.7609 24.64 20.4009 26.44 24.0009Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file$7, 13, 12, 740);
    			attr_dev(svg1, "width", "28");
    			attr_dev(svg1, "height", "32");
    			attr_dev(svg1, "viewBox", "0 0 28 32");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$7, 12, 8, 632);
    			attr_dev(span, "class", "n row middle-xs center-xs svelte-1qz8aav");
    			add_location(span, file$7, 15, 8, 2060);
    			attr_dev(button1, "class", "row middle-xs center-xs svelte-1qz8aav");
    			add_location(button1, file$7, 11, 4, 583);
    			attr_dev(header, "class", "row middle-xs between-xs svelte-1qz8aav");
    			add_location(header, file$7, 4, 0, 21);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(header, t0);
    			append_dev(header, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path2);
    			append_dev(button1, t1);
    			append_dev(button1, span);
    			append_dev(span, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Menu.svelte generated by Svelte v3.32.3 */

    const file$8 = "src/components/Menu.svelte";

    function create_fragment$a(ctx) {
    	let header;
    	let button0;
    	let svg0;
    	let path0;
    	let t0;
    	let button1;
    	let svg1;
    	let path1;
    	let t1;
    	let button2;
    	let svg2;
    	let path2;
    	let t2;
    	let button3;
    	let svg3;
    	let path3;

    	const block = {
    		c: function create() {
    			header = element("header");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t2 = space();
    			button3 = element("button");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			button0 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);

    			svg0 = claim_element(
    				button0_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);
    			path0 = claim_element(svg0_nodes, "path", { d: true, fill: true }, 1);
    			children(path0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			t0 = claim_space(header_nodes);
    			button1 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);

    			svg1 = claim_element(
    				button1_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);

    			path1 = claim_element(
    				svg1_nodes,
    				"path",
    				{
    					d: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			t1 = claim_space(header_nodes);
    			button2 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button2_nodes = children(button2);

    			svg2 = claim_element(
    				button2_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg2_nodes = children(svg2);
    			path2 = claim_element(svg2_nodes, "path", { d: true, fill: true }, 1);
    			children(path2).forEach(detach_dev);
    			svg2_nodes.forEach(detach_dev);
    			button2_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			button3 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button3_nodes = children(button3);

    			svg3 = claim_element(
    				button3_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg3_nodes = children(svg3);

    			path3 = claim_element(
    				svg3_nodes,
    				"path",
    				{
    					d: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path3).forEach(detach_dev);
    			svg3_nodes.forEach(detach_dev);
    			button3_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path0, "d", "M2.00001 15.3333H3.33334V24.6666C3.33334 26.1373 4.52934 27.3333 6.00001 27.3333H22C23.4707 27.3333 24.6667 26.1373 24.6667 24.6666V15.3333H26C26.2637 15.3333 26.5214 15.255 26.7406 15.1085C26.9598 14.962 27.1307 14.7538 27.2316 14.5102C27.3325 14.2666 27.3589 13.9985 27.3075 13.7399C27.256 13.4813 27.1291 13.2438 26.9427 13.0573L14.9427 1.05732C14.819 0.933389 14.672 0.835072 14.5103 0.767991C14.3485 0.70091 14.1751 0.666382 14 0.666382C13.8249 0.666382 13.6515 0.70091 13.4898 0.767991C13.328 0.835072 13.1811 0.933389 13.0573 1.05732L1.05734 13.0573C0.870932 13.2438 0.74399 13.4813 0.692566 13.7399C0.641143 13.9985 0.667547 14.2666 0.76844 14.5102C0.869334 14.7538 1.04019 14.962 1.2594 15.1085C1.47861 15.255 1.73634 15.3333 2.00001 15.3333ZM11.3333 24.6666V18H16.6667V24.6666H11.3333ZM14 3.88532L22 11.8853V18L22.0013 24.6666H19.3333V18C19.3333 16.5293 18.1373 15.3333 16.6667 15.3333H11.3333C9.86268 15.3333 8.66668 16.5293 8.66668 18V24.6666H6.00001V11.8853L14 3.88532Z");
    			attr_dev(path0, "fill", "#2291FF");
    			add_location(path0, file$8, 7, 12, 224);
    			attr_dev(svg0, "width", "28");
    			attr_dev(svg0, "height", "28");
    			attr_dev(svg0, "viewBox", "0 0 28 28");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$8, 6, 8, 116);
    			attr_dev(button0, "class", "row middle-xs center-xs svelte-1n7os0m");
    			add_location(button0, file$8, 5, 4, 67);
    			attr_dev(path1, "d", "M25 17C25 17.7072 24.719 18.3855 24.219 18.8856C23.7189 19.3857 23.0406 19.6667 22.3333 19.6667H6.33333L1 25V3.66667C1 2.95942 1.28095 2.28115 1.78105 1.78105C2.28115 1.28095 2.95942 1 3.66667 1H22.3333C23.0406 1 23.7189 1.28095 24.219 1.78105C24.719 2.28115 25 2.95942 25 3.66667V17Z");
    			attr_dev(path1, "stroke", "#333333");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			add_location(path1, file$8, 12, 12, 1430);
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 26 26");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$8, 11, 8, 1322);
    			attr_dev(button1, "class", "row middle-xs center-xs svelte-1n7os0m");
    			add_location(button1, file$8, 10, 4, 1273);
    			attr_dev(path2, "d", "M0 1.06667C0 0.783769 0.112384 0.512458 0.312429 0.312419C0.512474 0.112381 0.783793 0 1.0667 0H4.2668C4.50474 6.57312e-05 4.73583 0.0796815 4.92331 0.226186C5.1108 0.372691 5.24392 0.577672 5.3015 0.808533L6.16552 4.26667H30.9343C31.0909 4.26681 31.2456 4.30145 31.3873 4.36811C31.5291 4.43477 31.6544 4.53183 31.7544 4.65238C31.8543 4.77294 31.9266 4.91403 31.9659 5.06564C32.0052 5.21725 32.0106 5.37565 31.9818 5.5296L28.7817 22.5963C28.7359 22.8407 28.6062 23.0615 28.4149 23.2204C28.2237 23.3793 27.9829 23.4664 27.7342 23.4667H8.5336C8.28491 23.4664 8.04412 23.3793 7.85285 23.2204C7.66158 23.0615 7.53186 22.8407 7.4861 22.5963L4.28813 5.5616L3.43477 2.13333H1.0667C0.783793 2.13333 0.512474 2.02095 0.312429 1.82091C0.112384 1.62088 0 1.34956 0 1.06667ZM6.6178 6.4L9.41896 21.3333H26.8488L29.65 6.4H6.6178ZM10.667 23.4667C9.53537 23.4667 8.45009 23.9162 7.64991 24.7163C6.84973 25.5165 6.4002 26.6017 6.4002 27.7333C6.4002 28.8649 6.84973 29.9502 7.64991 30.7503C8.45009 31.5505 9.53537 32 10.667 32C11.7986 32 12.8839 31.5505 13.6841 30.7503C14.4843 29.9502 14.9338 28.8649 14.9338 27.7333C14.9338 26.6017 14.4843 25.5165 13.6841 24.7163C12.8839 23.9162 11.7986 23.4667 10.667 23.4667ZM25.6008 23.4667C24.4692 23.4667 23.3839 23.9162 22.5837 24.7163C21.7835 25.5165 21.334 26.6017 21.334 27.7333C21.334 28.8649 21.7835 29.9502 22.5837 30.7503C23.3839 31.5505 24.4692 32 25.6008 32C26.7324 32 27.8177 31.5505 28.6179 30.7503C29.4181 29.9502 29.8676 28.8649 29.8676 27.7333C29.8676 26.6017 29.4181 25.5165 28.6179 24.7163C27.8177 23.9162 26.7324 23.4667 25.6008 23.4667ZM10.667 25.6C11.2328 25.6 11.7754 25.8248 12.1755 26.2248C12.5756 26.6249 12.8004 27.1675 12.8004 27.7333C12.8004 28.2991 12.5756 28.8418 12.1755 29.2418C11.7754 29.6419 11.2328 29.8667 10.667 29.8667C10.1012 29.8667 9.55855 29.6419 9.15846 29.2418C8.75837 28.8418 8.5336 28.2991 8.5336 27.7333C8.5336 27.1675 8.75837 26.6249 9.15846 26.2248C9.55855 25.8248 10.1012 25.6 10.667 25.6ZM25.6008 25.6C26.1666 25.6 26.7092 25.8248 27.1093 26.2248C27.5094 26.6249 27.7342 27.1675 27.7342 27.7333C27.7342 28.2991 27.5094 28.8418 27.1093 29.2418C26.7092 29.6419 26.1666 29.8667 25.6008 29.8667C25.035 29.8667 24.4923 29.6419 24.0923 29.2418C23.6922 28.8418 23.4674 28.2991 23.4674 27.7333C23.4674 27.1675 23.6922 26.6249 24.0923 26.2248C24.4923 25.8248 25.035 25.6 25.6008 25.6Z");
    			attr_dev(path2, "fill", "#333333");
    			add_location(path2, file$8, 17, 12, 2008);
    			attr_dev(svg2, "width", "28");
    			attr_dev(svg2, "height", "28");
    			attr_dev(svg2, "viewBox", "0 0 32 32");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$8, 16, 8, 1900);
    			attr_dev(button2, "class", "row middle-xs center-xs svelte-1n7os0m");
    			add_location(button2, file$8, 15, 4, 1851);
    			attr_dev(path3, "d", "M19 9C19 14 16 18 13 18C10 18 7 14 7 9C7 4 9 1 13 1C17 1 19 4 19 9ZM1 28H25C25 19 19 18 13 18C7 18 1 19 1 28Z");
    			attr_dev(path3, "stroke", "#333333");
    			attr_dev(path3, "stroke-width", "2");
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			add_location(path3, file$8, 22, 12, 4584);
    			attr_dev(svg3, "width", "24");
    			attr_dev(svg3, "height", "28");
    			attr_dev(svg3, "viewBox", "0 0 26 29");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg3, file$8, 21, 8, 4476);
    			attr_dev(button3, "class", "row middle-xs center-xs svelte-1n7os0m");
    			add_location(button3, file$8, 20, 4, 4427);
    			attr_dev(header, "class", "row middle-xs between-xs svelte-1n7os0m");
    			add_location(header, file$8, 4, 0, 21);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(header, t0);
    			append_dev(header, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(header, t1);
    			append_dev(header, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(header, t2);
    			append_dev(header, button3);
    			append_dev(button3, svg3);
    			append_dev(svg3, path3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/pages/products/Home.svelte generated by Svelte v3.32.3 */
    const file$9 = "src/pages/products/Home.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let menu;
    	let current;
    	header = new Header({ $$inline: true });
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			create_component(menu.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(header.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div0 = claim_element(div3_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			claim_component(menu.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "na");
    			add_location(div0, file$9, 7, 4, 163);
    			attr_dev(div1, "class", "sfy");
    			add_location(div1, file$9, 10, 4, 196);
    			attr_dev(div2, "class", "c");
    			add_location(div2, file$9, 13, 4, 230);
    			attr_dev(div3, "class", "app svelte-1o2nv7t");
    			add_location(div3, file$9, 6, 0, 141);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			insert_dev(target, t3, anchor);
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t3);
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Menu });
    	return [];
    }

    class Home$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */

    // (16:1) <Route path="/">
    function create_default_slot_7(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(home.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(16:1) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:1) <Route path="/signin">
    function create_default_slot_6(ctx) {
    	let signin;
    	let current;
    	signin = new Signin({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signin.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(signin.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signin, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(17:1) <Route path=\\\"/signin\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:1) <Route path="/signup">
    function create_default_slot_5(ctx) {
    	let signup;
    	let current;
    	signup = new Signup({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(signup.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(18:1) <Route path=\\\"/signup\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:1) <Route path="/forgot-password">
    function create_default_slot_4(ctx) {
    	let forgotpassword;
    	let current;
    	forgotpassword = new ForgotPassword({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(forgotpassword.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(forgotpassword.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(forgotpassword, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(forgotpassword.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(forgotpassword.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(forgotpassword, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(19:1) <Route path=\\\"/forgot-password\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:1) <Route path="/forgot-password/verification">
    function create_default_slot_3(ctx) {
    	let verpassword;
    	let current;
    	verpassword = new VerPassword({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(verpassword.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(verpassword.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(verpassword, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(verpassword.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(verpassword.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(verpassword, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(20:1) <Route path=\\\"/forgot-password/verification\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:1) <Route path="/reset-password/:key">
    function create_default_slot_2(ctx) {
    	let resetpassword;
    	let current;
    	resetpassword = new ResetPassword({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(resetpassword.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(resetpassword.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resetpassword, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resetpassword.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resetpassword.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resetpassword, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:1) <Route path=\\\"/reset-password/:key\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:1) <Route path="/home">
    function create_default_slot_1(ctx) {
    	let products;
    	let current;
    	products = new Home$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(products.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(products.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(products, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(products.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(products.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(products, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(22:1) <Route path=\\\"/home\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:0) <Router url="{url}">
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let t5;
    	let route6;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/signin",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/signup",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/forgot-password",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/forgot-password/verification",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "/reset-password/:key",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route6 = new Route({
    			props: {
    				path: "/home",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			t5 = space();
    			create_component(route6.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(route0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(route1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			claim_component(route2.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			claim_component(route3.$$.fragment, nodes);
    			t3 = claim_space(nodes);
    			claim_component(route4.$$.fragment, nodes);
    			t4 = claim_space(nodes);
    			claim_component(route5.$$.fragment, nodes);
    			t5 = claim_space(nodes);
    			claim_component(route6.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    			const route6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route6_changes.$$scope = { dirty, ctx };
    			}

    			route6.$set(route6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(router.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		Signin,
    		Signup,
    		ForgotPassword,
    		VerPassword,
    		ResetPassword,
    		Products: Home$1,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	hydrate: true
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
