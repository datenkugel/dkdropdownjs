(AI generated)

# 🎯 Dropdown Kit Framework

A modern, lightweight, and highly customizable dropdown library with zero conflicts and comprehensive features.

## ✨ Features

- **🚀 Zero Setup** - Works out of the box with minimal configuration
- **� Bootstrap-Style** - Transform HTML select elements like Bootstrap dropdowns
- **�🔍 Built-in Search** - Fast, real-time option filtering
- **🌐 API Integration** - Dynamic data loading with error handling
- **🎨 Fully Customizable** - Complete control over styling and behavior
- **📱 Responsive Design** - Works seamlessly across all device sizes
- **♿ Accessibility** - ARIA compliant with keyboard navigation
- **🏷️ Grouped Options** - Organize options with labeled sections (supports optgroups)
- **🚫 Disabled States** - Support for disabled options and entire dropdown
- **🔄 Dynamic Updates** - Programmatic control with full API
- **📋 Form Integration** - Seamless form submission with hidden inputs
- **⚡ Performance** - Optimized for large datasets (tested with 85+ options)
- **🎯 No Conflicts** - Namespaced CSS classes (`dk_*`) prevent style conflicts
- **🔧 Progressive Enhancement** - Works with existing select elements

## 📦 Installation

1. **Download the files:**
   ```
   dk_dropdown.css
   dk_dropdown.js
   ```

2. **Include in your HTML:**
   ```html
   <link rel="stylesheet" href="dk_dropdown.css">
   <script src="dk_dropdown.js"></script>
   ```

## 🚀 Quick Start

### Method 1: Bootstrap-Style Select Enhancement (Recommended)
```html
<!-- 1. Create a regular HTML select element -->
<select id="my-select" name="country">
    <option value="">Choose a country...</option>
    <option value="us" selected>United States</option>
    <option value="ca">Canada</option>
    <option value="uk">United Kingdom</option>
</select>

<!-- 2. Transform it with JavaScript -->
<script>
const dropdown = new CustomDropdown('my-select');

// The original select is preserved for form submission
dropdown.onChange = (value, text) => {
    console.log(`Selected: ${text} (${value})`);
};
</script>
```

### Method 2: Div Container (Original)
```html
<!-- 1. Create a container element -->
<div id="my-dropdown"></div>

<!-- 2. Initialize with JavaScript -->
<script>
const dropdown = new CustomDropdown('my-dropdown', {
    options: [
        { value: "1", text: "Option 1" },
        { value: "2", text: "Option 2" },
        { value: "3", text: "Option 3" }
    ]
});

// 3. Handle selection changes
dropdown.onChange = (value, text) => {
    console.log(`Selected: ${text} (${value})`);
};
</script>
```

### Method 3: Auto-Initialize Multiple Selects
```html
<!-- Mark selects for auto-initialization -->
<select id="select1" data-dropdown name="category">
    <option value="">Choose category...</option>
    <option value="electronics">Electronics</option>
    <option value="clothing">Clothing</option>
</select>

<select id="select2" data-dropdown name="priority">
    <option value="">Set priority...</option>
    <option value="high">High</option>
    <option value="low">Low</option>
</select>

<script>
// Bootstrap-style bulk initialization
const dropdowns = CustomDropdown.initializeSelects('select[data-dropdown]');

// Add global change handler
dropdowns.forEach(dropdown => {
    dropdown.onChange = (value, text) => {
        console.log(`Selection changed: ${text}`);
    };
});
</script>
```

### Static Factory Method
```javascript
// Alternative syntax for quick creation
const dropdown = CustomDropdown.create('my-dropdown', {
    options: [
        { value: "apple", text: "🍎 Apple" },
        { value: "banana", text: "🍌 Banana" }
    ]
});
```

## 🎨 Configuration Options

```javascript
const dropdown = new CustomDropdown('element-id', data, {
    // Display options
    placeholder: 'Select an option...',
    searchPlaceholder: 'Search options...',
    arrowIcon: '▼',
    noResultsText: 'No results found',
    disabledSuffix: '(disabled)',
    
    // Functionality
    enableSearch: true,          // Enable/disable search functionality
    allowClear: false,           // Show clear button when option selected
    
    // Form integration
    name: 'dropdown-value',      // Name for hidden form input
    
    // API/Dynamic loading
    dataUrl: null,               // URL for fetching options
    dataResolver: null,          // Function to transform API response data
    loadingText: 'Loading...',
    errorText: 'Error loading data',
    fetchOptions: {}             // Additional fetch() options
});
```

## 📊 Data Formats

### Simple Options
```javascript
{
    options: [
        { value: "1", text: "First Option" },
        { value: "2", text: "Second Option", selected: true },
        { value: "3", text: "Third Option", disabled: true }
    ]
}
```

### Grouped Options

#### Via HTML optgroups (Automatic)
```html
<select id="grouped-select" name="product">
    <option value="">Select a product...</option>
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
// Groups are automatically extracted from optgroups
const dropdown = new CustomDropdown('grouped-select');
</script>
```

#### Via JavaScript Object
```javascript
{
    groups: [
        {
            label: "🍎 Fruits",
            options: [
                { value: "apple", text: "Apple" },
                { value: "banana", text: "Banana" }
            ]
        },
        {
            label: "🥕 Vegetables", 
            options: [
                { value: "carrot", text: "Carrot" },
                { value: "lettuce", text: "Lettuce", disabled: true }
            ]
        }
    ]
}
```

### API Integration

#### Basic API Loading
```javascript
const dropdown = new CustomDropdown('api-dropdown', {
    // Initial empty state - will load from API
    options: []
}, {
    dataUrl: 'https://api.example.com/options',
    fetchOptions: {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' }
    }
});
```

#### Data Transformation with `dataResolver`
```javascript
const dropdown = new CustomDropdown('users-dropdown', null, {
    dataUrl: 'https://jsonplaceholder.typicode.com/users',
    dataResolver: (apiResponse) => {
        // Transform API response to dropdown format
        return {
            options: apiResponse.map(user => ({
                value: user.id.toString(),
                text: `${user.name} (${user.email})`,
                disabled: !user.active // Example: disable inactive users
            }))
        };
    }
});

// For grouped data from API
const categoriesDropdown = new CustomDropdown('categories-dropdown', null, {
    dataUrl: 'https://api.example.com/product-categories',
    dataResolver: (apiResponse) => {
        // Transform nested API data to grouped format
        return {
            groups: apiResponse.categories.map(category => ({
                label: category.name,
                options: category.products.map(product => ({
                    value: product.id,
                    text: product.name,
                    disabled: product.outOfStock
                }))
            }))
        };
    }
});

// Handle complex nested API responses
const locationDropdown = new CustomDropdown('location-dropdown', null, {
    dataUrl: 'https://api.example.com/locations',
    dataResolver: (response) => {
        // Handle API response with nested structure
        const data = response.data || response; // Handle wrapped responses
        
        if (data.countries) {
            return {
                groups: data.countries.map(country => ({
                    label: `🏳️ ${country.name}`,
                    options: country.cities.map(city => ({
                        value: `${country.code}-${city.code}`,
                        text: `${city.name}, ${country.name}`
                    }))
                }))
            };
        }
        
        // Fallback for simple array
        return {
            options: data.map(item => ({
                value: item.id || item.value,
                text: item.name || item.text || item.label
            }))
        };
    }
});
```

#### Legacy API Loader (Alternative Method)
```javascript
// Custom API loader (if you prefer manual control)
dropdown.loadDataFromAPI = async function() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        
        this.data = {
            options: users.map(user => ({
                value: user.id.toString(),
                text: `${user.name} (${user.email})`
            }))
        };
        
        this.populateOptions();
        return true;
    } catch (error) {
        console.error('Loading failed:', error);
        return false;
    }
};
```

## 🔧 API Methods

### Static Methods
```javascript
// Create dropdown instance
const dropdown = CustomDropdown.create(elementId, data, options);

// Bootstrap-style auto-initialization
const dropdowns = CustomDropdown.initializeSelects('select[data-dropdown]');
const allDropdowns = CustomDropdown.initializeSelects(); // All select elements
```

### Core Methods
```javascript
// Get current selection
const value = dropdown.getValue();
const text = dropdown.getText(); // Updated method name

// Set selection programmatically
dropdown.setValue('option-value');

// Clear selection
dropdown.clear();

// Control dropdown state
dropdown.disable();
dropdown.enable();
dropdown.open();
dropdown.close();

// Data management
dropdown.reload(); // Reload from API if dataUrl provided

// Cleanup
dropdown.destroy(); // Restores original select element if applicable
```

### Event Handling
```javascript
// Selection change callback
dropdown.onChange = (value, text, optionData) => {
    console.log('Selected:', { value, text, optionData });
};

// Custom validation
dropdown.onChange = (value, text) => {
    if (value === 'restricted') {
        alert('This option requires admin access');
        dropdown.clear();
        return;
    }
    // Process valid selection
    updateForm(value);
};
```

## 🎨 Styling & Customization

The framework uses namespaced CSS classes with the `dk_` prefix to prevent conflicts:

```css
/* Main dropdown container */
.dk_dropdown { }

/* Selected value display */
.dk_selected { }

/* Dropdown list container */
.dk_options { }

/* Individual option */
.dk_option { }

/* Disabled option */
.dk_disabled { }

/* Group label */
.dk_group_label { }

/* Search input */
.dk_search_input { }

/* Loading state */
.dk_loading { }
```

### Custom Styling Example
```css
/* Custom theme */
.dk_dropdown {
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
}

.dk_selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.dk_option:hover {
    background: #f0f8ff;
    transform: translateX(4px);
}
```

## 📱 Responsive Design

The dropdown automatically adapts to different screen sizes:

```css
/* Mobile optimization */
@media (max-width: 768px) {
    .dk_options {
        max-height: 60vh; /* Prevent overwhelming small screens */
    }
    
    .dk_search_input {
        font-size: 16px; /* Prevent zoom on iOS */
    }
}
```

## ♿ Accessibility

Built-in accessibility features include:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Focus Management**: Logical tab order and focus indicators  
- **Screen Reader Support**: Announces selections and state changes

```javascript
// Additional accessibility options
const dropdown = new CustomDropdown('accessible-dropdown', data, {
    ariaLabel: 'Choose your preferred option',
    announceSelection: true
});
```

## 🔍 Real-World Examples

### E-commerce Category Selector
```javascript
const categoryDropdown = new CustomDropdown('product-category', {
    groups: [
        {
            label: "👔 Clothing",
            options: [
                { value: "shirts", text: "Shirts" },
                { value: "pants", text: "Pants" },
                { value: "shoes", text: "Shoes" }
            ]
        },
        {
            label: "📱 Electronics", 
            options: [
                { value: "phones", text: "Mobile Phones" },
                { value: "laptops", text: "Laptops" },
                { value: "tablets", text: "Tablets" }
            ]
        }
    ]
}, {
    placeholder: "Select a product category...",
    enableSearch: true
});
```

### Dynamic User Selection
```javascript
const userDropdown = new CustomDropdown('assign-user', null, {
    placeholder: "Loading users...",
    dataUrl: '/api/users',
    loadingText: 'Fetching team members...',
    dataResolver: (response) => {
        // Transform user API response
        return {
            groups: [
                {
                    label: "👤 Active Users",
                    options: response.users
                        .filter(user => user.status === 'active')
                        .map(user => ({
                            value: user.id,
                            text: `${user.firstName} ${user.lastName} (${user.department})`
                        }))
                },
                {
                    label: "⏸️ Inactive Users", 
                    options: response.users
                        .filter(user => user.status === 'inactive')
                        .map(user => ({
                            value: user.id,
                            text: `${user.firstName} ${user.lastName}`,
                            disabled: true
                        }))
                }
            ]
        };
    }
});

userDropdown.onChange = (userId, userName) => {
    assignTask(userId);
    showNotification(`Task assigned to ${userName}`);
};
```

### API Data with Custom Formatting
```javascript
const countryDropdown = new CustomDropdown('country-selector', null, {
    dataUrl: 'https://restcountries.com/v3.1/all?fields=name,cca2,flag',
    dataResolver: (countries) => {
        // Sort countries and add flag emojis
        const sortedCountries = countries
            .sort((a, b) => a.name.common.localeCompare(b.name.common))
            .map(country => ({
                value: country.cca2,
                text: `${country.flag} ${country.name.common}`,
                searchText: country.name.common // For better search matching
            }));
        
        return { options: sortedCountries };
    },
    placeholder: "🌍 Select a country...",
    enableSearch: true
});
```

## 🚀 Performance

- **Optimized for large datasets** (tested with 85+ options)
- **Efficient search algorithms** with real-time filtering
- **Memory management** with proper cleanup methods
- **Lazy loading** support for API-based data
- **Minimal DOM manipulation** for smooth interactions

## 🌟 Advanced Features

### Select Element Enhancement
```javascript
// Transform existing select with custom options
const dropdown = new CustomDropdown('existing-select', null, {
    enableSearch: true,
    arrowIcon: '🔽',
    placeholder: 'Custom placeholder...' // Overrides select placeholder
});

// The original select element remains functional for forms
console.log(document.getElementById('existing-select').value); // Gets current value
```

### Form Integration
```html
<form id="user-form">
    <select id="country-select" name="country" required>
        <option value="">Choose country...</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
    </select>
    
    <button type="submit">Submit</button>
</form>

<script>
// Enhanced select maintains form functionality
const dropdown = new CustomDropdown('country-select');

document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Country:', formData.get('country')); // Works seamlessly
});
</script>
```

### Custom Search Logic
```javascript
dropdown.customSearchFilter = (option, searchTerm) => {
    // Custom search implementation
    return option.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
           option.value.toLowerCase().includes(searchTerm.toLowerCase());
};
```

### Event Listeners on Original Select
```javascript
// Enhanced dropdowns trigger events on original select elements
const originalSelect = document.getElementById('my-select');
const dropdown = new CustomDropdown('my-select');

originalSelect.addEventListener('change', function() {
    console.log('Original select changed:', this.value);
    // This will fire when dropdown selections are made
});
```

## 📋 Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Fallbacks**: Graceful degradation for older browsers

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Migration from Other Libraries

### From Bootstrap Dropdowns
```javascript
// Before (Bootstrap)
$('#my-select').dropdown();

// After (Dropdown Kit)
const dropdown = new CustomDropdown('my-select');
// or
CustomDropdown.initializeSelects('#my-select');
```

### From Select2
```javascript
// Before (Select2)
$('#my-select').select2({
    placeholder: "Choose option...",
    allowClear: true
});

// After (Dropdown Kit)
const dropdown = new CustomDropdown('my-select', null, {
    placeholder: "Choose option...",
    allowClear: true
});
```

## 🧪 Testing & Examples

### Demo Files
- `demo.html` - Original div-based examples
- `select-demo.html` - Bootstrap-style select enhancement examples

### Real-World Scenarios
```javascript
// E-commerce product filters
CustomDropdown.initializeSelects('select[name="category"], select[name="brand"]', {
    enableSearch: true,
    placeholder: 'Filter products...'
});

// User management forms
const userRoleDropdown = new CustomDropdown('user-role-select', null, {
    arrowIcon: '👤',
    placeholder: 'Assign role...'
});

// Multi-language support
const languageDropdown = new CustomDropdown('language-select', null, {
    placeholder: document.documentElement.lang === 'es' ? 'Seleccionar idioma...' : 'Select language...'
});
```

## �📞 Support

- **Documentation**: See `demo.html` and `select-demo.html` for comprehensive examples
- **Issues**: Report bugs and feature requests via GitHub issues
- **Examples**: Check both demo files for div-based and select-based usage patterns
- **Migration**: See migration guide above for switching from other dropdown libraries

---

**Built with ❤️ for developers who value simplicity, flexibility, and modern web standards.**