# 🎯 Dropdown Kit (dk_dropdown)

A modern, lightweight, zero-dependency custom dropdown library with built-in search, API loading, grouped options, and seamless Bootstrap compatibility.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🚀 Zero dependencies | Pure vanilla JS — no jQuery, no frameworks required |
| 🔄 Select enhancement | Drop-in replacement for `<select>` elements |
| 🔍 Built-in search | Real-time option filtering |
| 🌐 API / async loading | Fetch options from any endpoint with a custom resolver |
| 🏷️ Grouped options | Via JS data object **or** HTML `<optgroup>` |
| 🚫 Disabled states | Per-option and full-dropdown disable support |
| 📋 Form integration | Hidden input keeps native forms working |
| 🎨 Namespaced CSS | All classes prefixed `dk_` — no Bootstrap conflicts |
| 📐 Bootstrap-safe panels | Panel uses `position: fixed` to escape `col-*` / `row` overflow clipping |
| 🪟 Single-open guarantee | Opening one dropdown automatically closes all others |
| ⬆️ Smart flip | Panel opens upward when there is not enough space below |
| ♿ Keyboard navigation | Arrow keys, Enter, Escape, Tab |
| 🔧 Full public API | `getValue`, `setValue`, `clear`, `open`, `close`, `disable`, `enable`, `reload`, `destroy` |

---

## 📦 Installation

Copy both files into your project and include them:

```html
<link rel="stylesheet" href="dk_dropdown.css">
<script src="dk_dropdown.js"></script>
```

No build step, no package manager required.

---

## 🚀 Quick Start

### Method 1 — Enhance an existing `<select>` (recommended)

```html
<select id="country" name="country">
    <option value="">Choose a country…</option>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="uk">United Kingdom</option>
</select>

<script>
const dropdown = new CustomDropdown('country');

dropdown.onChange = (value, text) => {
    console.log(`Selected: ${text} (${value})`);
};
</script>
```

The original `<select>` is hidden but stays in the DOM so standard form submission keeps working.

---

### Method 2 — Initialize a `<div>` container with JS data

```html
<div id="my-dropdown"></div>

<script>
const dropdown = new CustomDropdown('my-dropdown', {
    options: [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2', selected: true },
        { value: '3', text: 'Option 3', disabled: true }
    ]
});

dropdown.onChange = (value, text) => console.log(value, text);
</script>
```

---

### Method 3 — Bulk-initialize with `initializeSelects()`

```html
<select data-dropdown name="category">
    <option value="">Choose category…</option>
    <option value="electronics">Electronics</option>
    <option value="clothing">Clothing</option>
</select>

<select data-dropdown name="priority">
    <option value="">Set priority…</option>
    <option value="high">High</option>
    <option value="low">Low</option>
</select>

<script>
const dropdowns = CustomDropdown.initializeSelects('select[data-dropdown]');

dropdowns.forEach(dd => {
    dd.onChange = (value, text) => console.log('Changed:', text);
});
</script>
```

---

### Static factory shorthand

```javascript
const dropdown = CustomDropdown.create('my-dropdown', {
    options: [
        { value: 'a', text: 'Alpha' },
        { value: 'b', text: 'Beta' }
    ]
});
```

---

## ⚙️ Configuration Options

```javascript
const dropdown = new CustomDropdown('element-id', data, {
    // ── Display ───────────────────────────────────────────
    placeholder:       'Select an option…',   // Text shown when nothing is selected
    searchPlaceholder: 'Search options…',      // Placeholder inside the search box
    arrowIcon:         '▼',                   // Arrow indicator (any string or HTML)
    noResultsText:     'No results found',    // Shown when search has no matches
    disabledSuffix:    '(disabled)',          // Appended to disabled option labels

    // ── Behaviour ───────────────────────────────────────
    enableSearch: true,    // Set to false to hide the search box
    allowClear:   false,   // Show a clear/reset button when a value is selected

    // ── Form ────────────────────────────────────────────
    name: 'my-field',      // name attribute on the hidden input (auto-detected for <select>)

    // ── Async / API loading ──────────────────────────────
    dataUrl:      null,          // URL to fetch options from
    dataResolver: null,          // Function(apiResponse) → { options: [] } or { groups: [] }
    loadingText:  'Loading…',
    errorText:    'Error loading data',
    fetchOptions: {}             // Extra options passed to fetch() (headers, method, etc.)
});
```

---

## 📊 Data Formats

### Flat options

```javascript
{
    options: [
        { value: '1', text: 'First',  selected: true },
        { value: '2', text: 'Second' },
        { value: '3', text: 'Third',  disabled: true }
    ]
}
```

### Grouped options — via JS

```javascript
{
    groups: [
        {
            label: '🍎 Fruits',
            options: [
                { value: 'apple',  text: 'Apple' },
                { value: 'banana', text: 'Banana' }
            ]
        },
        {
            label: '🥕 Vegetables',
            options: [
                { value: 'carrot',  text: 'Carrot' },
                { value: 'lettuce', text: 'Lettuce', disabled: true }
            ]
        }
    ]
}
```

### Grouped options — via HTML `<optgroup>`

Groups are extracted automatically when a `<select>` with `<optgroup>` elements is used:

```html
<select id="products" name="product">
    <option value="">Select a product…</option>
    <optgroup label="🍎 Fruits">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
    </optgroup>
    <optgroup label="🥕 Vegetables">
        <option value="carrot">Carrot</option>
        <option value="lettuce" disabled>Lettuce (Out of Stock)</option>
    </optgroup>
</select>

<script>
const dropdown = new CustomDropdown('products'); // groups detected automatically
</script>
```

---

## 🌐 API / Async Loading

### Basic

```javascript
const dropdown = new CustomDropdown('users-dropdown', null, {
    dataUrl: '/api/users',
    fetchOptions: {
        headers: { 'Authorization': 'Bearer token' }
    }
});
```

### With `dataResolver` — transform any API shape

```javascript
const dropdown = new CustomDropdown('users-dropdown', null, {
    dataUrl: 'https://jsonplaceholder.typicode.com/users',
    dataResolver: (apiResponse) => ({
        options: apiResponse.map(user => ({
            value: user.id.toString(),
            text:  `${user.name} (${user.email})`
        }))
    })
});
```

### Grouped result from API

```javascript
const dropdown = new CustomDropdown('categories', null, {
    dataUrl: '/api/product-categories',
    dataResolver: (response) => ({
        groups: response.categories.map(cat => ({
            label:   cat.name,
            options: cat.products.map(p => ({
                value:    p.id,
                text:     p.name,
                disabled: p.outOfStock
            }))
        }))
    })
});
```

---

## 🔧 Public API

### Static methods

```javascript
// Factory method
const dropdown = CustomDropdown.create(elementId, data, options);

// Bulk-initialize all matching <select> elements
const dropdowns = CustomDropdown.initializeSelects('select[data-dropdown]', options);
```

### Instance methods

```javascript
// Read current selection
dropdown.getValue();   // → value string or null
dropdown.getText();    // → display text string or ''

// Set selection programmatically
dropdown.setValue('option-value');

// Clear selection
dropdown.clear();

// Open / close
dropdown.open();
dropdown.close();

// Disable / enable the whole dropdown
dropdown.disable();
dropdown.enable();

// Reload data from dataUrl (no-op if dataUrl was not set)
dropdown.reload();

// Remove the dropdown widget and restore the original <select>
dropdown.destroy();
```

### Event callback

```javascript
dropdown.onChange = (value, text) => {
    console.log('Selected:', value, text);
};
```

---

## 🎨 CSS Classes Reference

All classes are prefixed with `dk_` to avoid collisions with Bootstrap and other frameworks.

| Class | Description |
|---|---|
| `.dk_dropdown` | Root container |
| `.dk_selected` | The visible trigger button |
| `.dk_selected_text` | Text span inside the trigger |
| `.dk_placeholder` | Applied to trigger text when nothing is selected |
| `.dk_arrow` | Arrow indicator span |
| `.dk_active` | Added to `.dk_selected` while the panel is open |
| `.dk_content` | The floating panel |
| `.dk_show` | Added to `.dk_content` when open |
| `.dk_search_container` | Wrapper around the search input |
| `.dk_search` | The search `<input>` |
| `.dk_options` | Scrollable options list |
| `.dk_option` | Individual option row |
| `.dk_group_label` | Group heading inside the options list |
| `.dk_disabled` | Applied to a disabled option |
| `.dk_hidden` | Applied to options filtered out by search |
| `.dk_highlighted` | Keyboard-focus highlight on an option |
| `.dk_no_results` | "No results" message element |
| `.dk_loading` | Applied during async data load |
| `.dk_error` | Applied when async load fails |
| `.dk_spinner` | Animated loading spinner |

### Custom theme example

```css
.dk_selected {
    background: #1e1e2e;
    color: #cdd6f4;
    border-color: #6c7086;
    border-radius: 8px;
}

.dk_selected:hover,
.dk_selected:focus {
    border-color: #89b4fa;
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.2);
}

.dk_option:hover {
    background: #313244;
    color: #cdd6f4;
}

.dk_option.dk_selected {
    background: #89b4fa;
    color: #1e1e2e;
}
```

---

## 📐 Bootstrap Compatibility

### Grid columns (`col-*`)

Bootstrap’s `col-*` classes have `position: relative`, which makes them a CSS containing block. Without special handling, `position: absolute` dropdown panels are clipped to the column width.

**Dropdown Kit solves this automatically:** when a panel opens, it switches to `position: fixed` and computes its exact position from `getBoundingClientRect()`. The panel is therefore independent of any ancestor’s `position`, `overflow`, or `transform` properties.

### z-index layering

The panel uses `z-index: 9999` while open (reset to nothing on close), which places it above Bootstrap navbars (`1030`), modals (`1040–1055`), and tooltips (`1070` by default). Adjust in your own CSS if needed:

```css
.dk_content {
    z-index: 1100; /* override default for this project */
}
```

### Single-open guarantee

Only one dropdown panel is ever visible at a time. Opening a second dropdown automatically closes the first. This is managed via an internal static instance registry (`CustomDropdown._instances`) — no extra configuration needed.

---

## ♿ Keyboard Navigation

| Key | Action |
|---|---|
| `Enter` / `Space` | Open focused dropdown |
| `↑` / `↓` | Move between options |
| `Enter` | Select highlighted option |
| `Escape` | Close panel |
| `Tab` | Close panel and move to next focusable element |

When `enableSearch: true` (default), focus moves to the search input on open so typing immediately filters options.

---

## 📋 Form Integration

When a `<select>` is enhanced, the original element stays in the DOM (just hidden) and its value is kept in sync. Standard form submission — including `FormData`, `fetch`, and `XMLHttpRequest` — works without any extra code:

```html
<form id="my-form">
    <select id="country" name="country" required>
        <option value="">Choose…</option>
        <option value="us">United States</option>
    </select>
    <button type="submit">Submit</button>
</form>

<script>
new CustomDropdown('country');

document.getElementById('my-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(data.get('country')); // "us"
});
</script>
```

When using a `<div>` container, a hidden `<input type="hidden">` is created inside the widget and named via the `name` option.

---

## 📱 Responsive Design

The panel flips upward automatically when there is insufficient space below the trigger and more space above. On small screens the options list is capped at `250 px` height (vs `300 px` on larger screens) via a media query in `dk_dropdown.css`.

---

## 📋 Browser Support

| Browser | Minimum version |
|---|---|
| Chrome | 80+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge (Chromium) | 80+ |
| iOS Safari | 14+ |
| Chrome Android | 80+ |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
