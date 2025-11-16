class CustomDropdown {
    // Static method for quick dropdown creation
    static create(elementId, data, options = {}) {
        return new CustomDropdown(elementId, data, options);
    }
    
    // Static method to initialize dropdowns on select elements (Bootstrap-style)
    static initializeSelects(selector = 'select[data-dropdown]', options = {}) {
        const selectElements = document.querySelectorAll(selector);
        const dropdowns = [];
        
        selectElements.forEach((select, index) => {
            // Generate ID if one doesn't exist
            if (!select.id) {
                select.id = `dk_auto_select_${Date.now()}_${index}`;
            }
            
            const dropdown = new CustomDropdown(select.id, null, options);
            dropdowns.push(dropdown);
        });
        
        return dropdowns;
    }
    
    constructor(elementId, data, options = {}) {
        this.elementId = elementId;
        this.originalElement = document.getElementById(elementId);
        
        // Check if the target element is a select element
        this.isSelectElement = this.originalElement && this.originalElement.tagName.toLowerCase() === 'select';
        
        // If it's a select element and no data provided, extract from select options
        if (this.isSelectElement && !data) {
            this.data = this.extractDataFromSelect();
        } else {
            this.data = data;
        }
        
        this.options = {
            placeholder: options.placeholder || (this.isSelectElement ? this.getSelectPlaceholder() : 'Select an option...'),
            searchPlaceholder: options.searchPlaceholder || 'Search options...',
            name: options.name || (this.isSelectElement ? this.originalElement.name || elementId + 'Value' : elementId + 'Value'),
            arrowIcon: options.arrowIcon || '▼',
            noResultsText: options.noResultsText || 'No results found',
            disabledSuffix: options.disabledSuffix || '(disabled)',
            allowClear: options.allowClear || false,
            enableSearch: options.enableSearch !== false, // Default to true
            // Data loading options
            dataUrl: options.dataUrl || null,
            dataResolver: options.dataResolver || null,
            loadingText: options.loadingText || 'Loading...',
            errorText: options.errorText || 'Error loading data',
            fetchOptions: options.fetchOptions || {},
            ...options
        };
        
        this.selectedValue = null;
        this.selectedText = '';
        this.isOpen = false;
        this.searchTerm = '';
        this.onChange = null;
        this.allOptions = [];
        this.isLoading = false;
        this.isDisabled = false;
        
        this.init();
    }
    
    init() {
        if (!this.originalElement) {
            console.error(`Element with id "${this.elementId}" not found`);
            return;
        }
        
        this.createHTML();
        this.setupElements();
        this.setupHiddenInput();
        this.attachEvents();
        
        // Load data from URL or use provided data
        if (this.options.dataUrl) {
            this.loadDataFromUrl();
        } else {
            this.populateOptions();
            this.setInitialSelection();
        }
    }

    extractDataFromSelect() {
        if (!this.originalElement || this.originalElement.tagName.toLowerCase() !== 'select') {
            return null;
        }

        const options = [];
        const optGroups = this.originalElement.querySelectorAll('optgroup');
        
        if (optGroups.length > 0) {
            // Handle optgroups
            const groups = [];
            optGroups.forEach(optGroup => {
                const groupOptions = [];
                const optElements = optGroup.querySelectorAll('option');
                
                optElements.forEach(opt => {
                    if (opt.value !== '' || opt.textContent.trim() !== '') {
                        groupOptions.push({
                            value: opt.value,
                            text: opt.textContent.trim(),
                            selected: opt.selected,
                            disabled: opt.disabled
                        });
                    }
                });
                
                if (groupOptions.length > 0) {
                    groups.push({
                        label: optGroup.label,
                        options: groupOptions
                    });
                }
            });
            
            return { groups };
        } else {
            // Handle simple options
            const optElements = this.originalElement.querySelectorAll('option');
            
            optElements.forEach(opt => {
                // Skip empty placeholder options
                if (opt.value !== '' || opt.textContent.trim() !== '') {
                    options.push({
                        value: opt.value,
                        text: opt.textContent.trim(),
                        selected: opt.selected,
                        disabled: opt.disabled
                    });
                }
            });
            
            return { options };
        }
    }

    getSelectPlaceholder() {
        if (!this.originalElement || this.originalElement.tagName.toLowerCase() !== 'select') {
            return 'Select an option...';
        }

        // Check for a placeholder option (empty value or data-placeholder attribute)
        const firstOption = this.originalElement.querySelector('option');
        if (firstOption && (firstOption.value === '' || firstOption.hasAttribute('data-placeholder'))) {
            return firstOption.textContent.trim();
        }

        // Check for a placeholder attribute on the select element
        if (this.originalElement.hasAttribute('data-placeholder')) {
            return this.originalElement.getAttribute('data-placeholder');
        }

        return 'Select an option...';
    }
    
    createHTML() {
        // Generate the complete HTML structure
        const html = `
            <div class="dk_dropdown" data-name="${this.options.name}">
                <input type="hidden" name="${this.options.name}" value="">
                <div class="dk_selected" tabindex="0">
                    <span class="dk_selected_text dk_placeholder">${this.options.placeholder}</span>
                    <span class="dk_arrow">${this.options.arrowIcon}</span>
                </div>
                <div class="dk_content">
                    ${this.options.enableSearch ? `
                    <div class="dk_search_container">
                        <input type="text" class="dk_search" placeholder="${this.options.searchPlaceholder}">
                    </div>
                    ` : ''}
                    <div class="dk_options">
                        <!-- Options will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        `;
        
        if (this.isSelectElement) {
            // Hide the original select element
            this.originalElement.style.display = 'none';
            
            // Create a wrapper div and insert the dropdown after the select element
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            this.originalElement.parentNode.insertBefore(wrapper.firstElementChild, this.originalElement.nextSibling);
            
            // Update element reference to the dropdown container
            this.element = this.originalElement.nextElementSibling;
        } else {
            // Original behavior for div elements
            this.originalElement.innerHTML = html;
            
            // Update element reference to the dropdown container
            this.element = this.originalElement.querySelector('.dk_dropdown');
        }
    }
    
    async loadDataFromUrl() {
        this.setLoadingState(true);
        
        try {
            const response = await fetch(this.options.dataUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.options.fetchOptions.headers
                },
                ...this.options.fetchOptions
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const resolver = this.options.dataResolver ?? function(json) { return json; };
            this.data = resolver(data);
            
            this.setLoadingState(false);
            this.populateOptions();
            this.setInitialSelection();
            
        } catch (error) {
            console.error('Error loading dropdown data:', error);
            this.setErrorState();
        }
    }
    
    setLoadingState(loading) {
        this.isLoading = loading;
        this.isDisabled = loading;
        
        if (loading) {
            this.selectedTextElement.textContent = this.options.loadingText;
            this.selectedTextElement.classList.add('dk_loading');
            this.selectedElement.classList.add('dk_loading');
            this.selectedElement.style.pointerEvents = 'none';
            
            // Add spinner to arrow
            this.arrowElement.innerHTML = this.createSpinner();
        } else {
            this.selectedTextElement.classList.remove('dk_loading');
            this.selectedElement.classList.remove('dk_loading');
            this.selectedElement.style.pointerEvents = 'auto';
            
            // Restore arrow
            this.arrowElement.innerHTML = this.options.arrowIcon;
        }
    }
    
    setErrorState() {
        this.isLoading = false;
        this.isDisabled = true;
        
        this.selectedTextElement.textContent = this.options.errorText;
        this.selectedTextElement.classList.add('dk_error');
        this.selectedElement.classList.add('dk_error');
        this.selectedElement.style.pointerEvents = 'none';
        
        // Show error icon
        this.arrowElement.innerHTML = '⚠';
    }
    
    createSpinner() {
        return '<div class="dk_spinner"></div>';
    }
    
    setupElements() {
        this.selectedElement = this.element.querySelector('.dk_selected');
        this.selectedTextElement = this.element.querySelector('.dk_selected_text');
        this.arrowElement = this.element.querySelector('.dk_arrow');
        this.contentElement = this.element.querySelector('.dk_content');
        this.searchElement = this.element.querySelector('.dk_search');
        this.optionsContainer = this.element.querySelector('.dk_options');
        this.hiddenInput = this.element.querySelector('input[type="hidden"]');
    }
    
    setupHiddenInput() {
        // Hidden input is already created in createHTML(), just ensure it's properly configured
        if (this.hiddenInput) {
            this.hiddenInput.id = this.options.name + 'Input';
        }
        
        // If this is a select element, we'll update the original select instead of using hidden input
        if (this.isSelectElement) {
            // Keep the original select's name and form association
            this.hiddenInput.removeAttribute('name');
        }
    }
    
    populateOptions() {
        this.optionsContainer.innerHTML = '';
        this.allOptions = [];
        
        // Check if data exists before processing
        if (!this.data) {
            return;
        }
        
        if (this.data.groups) {
            // Handle grouped options
            this.data.groups.forEach(group => {
                // Add group label if provided
                if (group.label) {
                    const groupLabel = document.createElement('div');
                    groupLabel.className = 'dk_group_label';
                    groupLabel.textContent = group.label;
                    this.optionsContainer.appendChild(groupLabel);
                }
                
                // Add options
                group.options.forEach(option => {
                    this.createOption(option, group.label);
                });
            });
        } else if (this.data.options) {
            // Handle simple options array
            this.data.options.forEach(option => {
                this.createOption(option);
            });
        }
    }
    
    createOption(optionData, groupLabel = null) {
        const option = document.createElement('div');
        option.className = 'dk_option';
        
        // Set text content with disabled suffix if applicable
        const displayText = optionData.disabled ? 
            `${optionData.text} ${this.options.disabledSuffix}` : 
            optionData.text;
        option.textContent = displayText;
        
        option.dataset.value = optionData.value;
        option.dataset.text = optionData.text;
        option.dataset.group = groupLabel || '';
        
        // Handle disabled state
        if (optionData.disabled) {
            option.classList.add('dk_disabled');
        }
        
        // Handle selected state
        if (optionData.selected) {
            option.classList.add('dk_selected');
            this.selectedValue = optionData.value;
            this.selectedText = optionData.text;
        }
        
        this.optionsContainer.appendChild(option);
        
        // Store in allOptions for searching
        this.allOptions.push({
            element: option,
            value: optionData.value,
            text: optionData.text.toLowerCase(),
            disabled: optionData.disabled || false,
            group: groupLabel || ''
        });
    }
    
    attachEvents() {
        // Toggle dropdown
        this.selectedElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Option selection
        this.optionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dk_option') && 
                !e.target.classList.contains('dk_disabled')) {
                this.selectOption(e.target.dataset.value, e.target.dataset.text);
            }
        });
        
        // Search functionality
        if (this.searchElement) {
            this.searchElement.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterOptions();
            });
            
            // Prevent dropdown from closing when typing in search
            this.searchElement.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
        
        // Keyboard navigation for dropdown itself
        this.selectedElement.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                this.handleKeyboard(e);
            } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.open();
            }
        });
        
        // Global keyboard navigation when dropdown is open
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                this.handleKeyboard(e);
            }
        });
    }
    
    filterOptions() {
        let hasVisibleOptions = false;
        let currentGroup = null;
        
        this.allOptions.forEach(option => {
            const matchesSearch = option.text.includes(this.searchTerm);
            
            if (matchesSearch) {
                option.element.classList.remove('dk_hidden');
                // Count as visible option only if it's not disabled
                if (!option.disabled) {
                    hasVisibleOptions = true;
                }
            } else {
                option.element.classList.add('dk_hidden');
            }
        });
        
        // Hide/show group labels based on whether they have visible options
        const groupLabels = this.optionsContainer.querySelectorAll('.dk_group_label');
        groupLabels.forEach(label => {
            const groupName = label.textContent;
            const hasVisibleOptionsInGroup = this.allOptions.some(option => 
                option.group === groupName && 
                !option.element.classList.contains('dk_hidden')
            );
            
            if (hasVisibleOptionsInGroup) {
                label.style.display = 'block';
            } else {
                label.style.display = 'none';
            }
        });
        
        // Show no results message if needed
        this.toggleNoResults(!hasVisibleOptions && this.searchTerm);
    }
    
    toggleNoResults(show) {
        let noResultsElement = this.optionsContainer.querySelector('.dk_no_results');
        
        if (show && !noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.className = 'dk_no_results';
            noResultsElement.textContent = this.options.noResultsText;
            this.optionsContainer.appendChild(noResultsElement);
        } else if (!show && noResultsElement) {
            noResultsElement.remove();
        }
    }
    
    handleKeyboard(e) {
        const visibleOptions = this.allOptions.filter(option => 
            !option.element.classList.contains('dk_hidden') && 
            !option.disabled
        );
        
        if (visibleOptions.length === 0) return;
        
        const currentIndex = visibleOptions.findIndex(option => 
            option.element.classList.contains('dk_highlighted')
        );
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightOption(visibleOptions, currentIndex + 1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.highlightOption(visibleOptions, currentIndex - 1);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    const option = visibleOptions[currentIndex];
                    this.selectOption(option.value, option.element.dataset.text);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }
    
    highlightOption(visibleOptions, index) {
        // Remove existing highlight
        this.allOptions.forEach(option => {
            option.element.classList.remove('dk_highlighted');
        });
        
        // Wrap around navigation
        if (index < 0) {
            index = visibleOptions.length - 1;
        } else if (index >= visibleOptions.length) {
            index = 0;
        }
        
        // Add highlight to new option
        if (index >= 0 && index < visibleOptions.length) {
            const option = visibleOptions[index];
            option.element.classList.add('dk_highlighted');
            option.element.scrollIntoView({ block: 'nearest' });
        }
    }
    
    selectOption(value, text) {
        // Remove previous selection
        this.optionsContainer.querySelectorAll('.dk_option').forEach(option => {
            option.classList.remove('dk_selected');
        });
        
        // Set new selection
        const selectedOption = this.optionsContainer.querySelector(`[data-value="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.add('dk_selected');
        }
        
        this.selectedValue = value;
        this.selectedText = text;
        
        // Update display
        this.selectedTextElement.textContent = text;
        this.selectedTextElement.classList.remove('dk_placeholder');
        
        // Update hidden input for form submission
        if (this.hiddenInput) {
            this.hiddenInput.value = value;
        }
        
        // Update original select element if this is a select-based dropdown
        if (this.isSelectElement) {
            this.originalElement.value = value;
            
            // Also update the selected property of the option elements
            Array.from(this.originalElement.options).forEach(option => {
                option.selected = option.value === value;
            });
            
            // Trigger change event on original select for form validation/frameworks
            const selectChangeEvent = new Event('change', { bubbles: true });
            this.originalElement.dispatchEvent(selectChangeEvent);
        }
        
        // Close dropdown
        this.close();
        
        // Trigger change event
        if (this.onChange && typeof this.onChange === 'function') {
            this.onChange(value, text);
        }
        
        // Dispatch custom event
        const dropdownChangeEvent = new CustomEvent('dropdown-change', {
            detail: { value, text }
        });
        this.element.dispatchEvent(dropdownChangeEvent);
    }
    
    setInitialSelection() {
        // For select elements, check if there's a pre-selected option
        if (this.isSelectElement && this.originalElement.selectedIndex >= 0) {
            const selectedOption = this.originalElement.options[this.originalElement.selectedIndex];
            if (selectedOption && selectedOption.value !== '') {
                this.selectedValue = selectedOption.value;
                this.selectedText = selectedOption.textContent.trim();
            }
        }
        
        if (this.selectedValue && this.selectedText) {
            this.selectedTextElement.textContent = this.selectedText;
            this.selectedTextElement.classList.remove('dk_placeholder');
            
            // Set initial value in hidden input
            if (this.hiddenInput) {
                this.hiddenInput.value = this.selectedValue;
            }
            
            // Ensure the original select element is also set correctly
            if (this.isSelectElement) {
                this.originalElement.value = this.selectedValue;
            }
        } else {
            this.selectedTextElement.textContent = this.options.placeholder;
            this.selectedTextElement.classList.add('dk_placeholder');
        }
    }
    
    open() {
        if (this.isOpen || this.isLoading || this.isDisabled) return;
        
        this.isOpen = true;
        this.selectedElement.classList.add('dk_active');
        this.contentElement.classList.add('dk_show');
        
        // Reset search
        this.searchTerm = '';
        if (this.searchElement) {
            this.searchElement.value = '';
        }
        this.filterOptions();
        
        // Highlight currently selected option or first available option for keyboard navigation
        setTimeout(() => {
            const visibleOptions = this.allOptions.filter(option => 
                !option.element.classList.contains('dk_hidden') && 
                !option.disabled
            );
            
            if (visibleOptions.length > 0) {
                let startIndex = 0;
                
                // If there's a selected value, find its index in visible options
                if (this.selectedValue) {
                    const selectedIndex = visibleOptions.findIndex(option => 
                        option.value === this.selectedValue
                    );
                    if (selectedIndex >= 0) {
                        startIndex = selectedIndex;
                    }
                }
                
                this.highlightOption(visibleOptions, startIndex);
            }
            
            // Focus search if available, otherwise focus the dropdown
            if (this.searchElement) {
                this.searchElement.focus();
            } else {
                this.selectedElement.focus();
            }
        }, 50);
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.selectedElement.classList.remove('dk_active');
        this.contentElement.classList.remove('dk_show');
        
        // Clear search
        this.searchTerm = '';
        if (this.searchElement) {
            this.searchElement.value = '';
        }
        this.filterOptions();
        
        // Remove highlights
        this.allOptions.forEach(option => {
            option.element.classList.remove('dk_highlighted');
        });
    }
    
    toggle() {
        // Prevent interaction while loading or disabled
        if (this.isLoading || this.isDisabled) {
            return;
        }
        
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // Public methods
    getValue() {
        return this.selectedValue;
    }
    
    getText() {
        return this.selectedText;
    }
    
    setValue(value) {
        const option = this.allOptions.find(opt => opt.value === value);
        if (option && !option.disabled) {
            this.selectOption(value, option.element.dataset.text);
        }
    }
    
    clear() {
        this.selectedValue = null;
        this.selectedText = '';
        this.selectedTextElement.textContent = this.options.placeholder;
        this.selectedTextElement.classList.add('dk_placeholder');
        
        // Clear hidden input
        if (this.hiddenInput) {
            this.hiddenInput.value = '';
        }
        
        // Clear original select element if this is a select-based dropdown
        if (this.isSelectElement) {
            this.originalElement.selectedIndex = -1;
            
            // Also clear the selected property of all option elements
            Array.from(this.originalElement.options).forEach(option => {
                option.selected = false;
            });
            
            // Trigger change event on original select
            const changeEvent = new Event('change', { bubbles: true });
            this.originalElement.dispatchEvent(changeEvent);
        }
        
        // Remove selection from options
        this.optionsContainer.querySelectorAll('.dk_option').forEach(option => {
            option.classList.remove('dk_selected');
        });
        
        if (this.onChange && typeof this.onChange === 'function') {
            this.onChange(null, '');
        }
    }
    
    disable() {
        this.selectedElement.style.pointerEvents = 'none';
        this.selectedElement.style.opacity = '0.6';
    }
    
    enable() {
        this.selectedElement.style.pointerEvents = 'auto';
        this.selectedElement.style.opacity = '1';
    }
    
    reload() {
        if (this.options.dataUrl) {
            this.allOptions = [];
            this.optionsContainer.innerHTML = '';
            this.loadDataFromUrl();
        }
    }
    
    destroy() {
        // Remove event listeners and clean up
        if (this.isSelectElement) {
            // Show the original select element
            this.originalElement.style.display = '';
            // Remove the dropdown element
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        } else {
            // Original behavior for div elements
            this.element.innerHTML = '';
        }
    }
}