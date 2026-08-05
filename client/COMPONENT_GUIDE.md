# SaveCare Premium Component Library

## Overview
This document outlines all premium components and features added to enhance SaveCare into a world-class healthcare platform.

## 🎨 New Premium Components

### 1. **Toast Notifications** (`Toast.jsx`)
Advanced notification system with auto-dismiss and custom types.

```jsx
import { Toast, ToastContainer } from './components/Toast';

// Usage in state management context
const [toasts, setToasts] = useState([]);

const addToast = (type, title, message) => {
  const id = Date.now();
  setToasts(t => [...t, { id, type, title, message, autoClose: 4000 }]);
};

// Types: 'success', 'warning', 'error', 'info'
```

**Features:**
- Auto-dismiss with customizable duration
- Smooth entrance/exit animations
- Multiple toast stacking
- Close button
- Icon indicators

---

### 2. **Tooltip** (`Tooltip.jsx`)
Elegant hover tooltips for additional context.

```jsx
import Tooltip from './components/Tooltip';

<Tooltip content="This is helpful text" position="top">
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content`: Tooltip text
- `position`: 'top' | 'bottom' | 'left' | 'right'
- `delay`: Delay before showing (ms)

---

### 3. **DataCard** (`DataCard.jsx`)
Enhanced stat card with loading states and trends.

```jsx
import DataCard from './components/DataCard';

<DataCard
  icon={<MdPeople size={28} />}
  label="Total Patients"
  value="1,247"
  subtitle="Active patients"
  trend="+12.5%"
  color="var(--accent-teal)"
  loading={isLoading}
  onClick={handleCardClick}
/>
```

**Features:**
- Loading skeleton animation
- Gradient background
- Trend indicators
- Click handling
- Smooth hover lift effect

---

### 4. **InputField** (`InputField.jsx`)
Advanced form input with validation feedback.

```jsx
import InputField from './components/InputField';

<InputField
  label="Email Address"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  type="email"
  required
  error={emailError}
  success={emailValid}
  helpText="We'll never share your email"
  icon={MdEmail}
/>
```

**Features:**
- Real-time validation feedback
- Success/error indicators
- Optional icon
- Helper text
- Smooth focus states
- Tooltip error messages

---

### 5. **EmptyState** (`EmptyState.jsx`)
Beautiful empty state for zero-data scenarios.

```jsx
import EmptyState from './components/EmptyState';

<EmptyState
  icon={<MdFolderOpen size={64} />}
  title="No Records Found"
  description="Start by adding a new medical record to get started"
  action={() => openCreateModal()}
  actionLabel="Create Record"
/>
```

---

### 6. **LoadingState** (`LoadingState.jsx`)
Premium loading indicator with dual-ring spinner.

```jsx
import LoadingState from './components/LoadingState';

<LoadingState message="Loading patient data..." />
```

**Features:**
- Dual-ring rotating spinner
- Pulsing message text
- Centered layout
- Smooth animations

---

### 7. **InfoBanner** (`InfoBanner.jsx`)
Contextual alerts and announcements.

```jsx
import InfoBanner from './components/InfoBanner';

<InfoBanner
  type="warning"
  title="Maintenance Notice"
  message="System maintenance scheduled for tonight at 10 PM"
  action={() => handleLearnMore()}
  actionLabel="Learn More"
  dismissible={true}
/>
```

**Types:** 'success' | 'warning' | 'error' | 'info'

---

### 8. **SearchBar** (`SearchBar.jsx`)
Advanced search with suggestions.

```jsx
import SearchBar from './components/SearchBar';

<SearchBar
  placeholder="Search patients..."
  value={search}
  onChange={setSearch}
  suggestions={patientNames}
  onSelectSuggestion={(name) => filterByName(name)}
/>
```

**Features:**
- Autocomplete suggestions
- Clear button
- Dynamic suggestion filtering
- Smooth dropdown animation

---

### 9. **Button** (`Button.jsx`)
Enhanced button with multiple variants.

```jsx
import Button from './components/Button';

<Button variant="primary" size="lg" loading={isSaving}>
  Save Changes
</Button>

<Button variant="secondary" icon={MdDownload} iconPosition="right">
  Export Data
</Button>
```

**Variants:** 'primary' | 'secondary' | 'danger' | 'ghost'
**Sizes:** 'sm' | 'md' | 'lg' | 'xl'

---

## 🎯 Enhanced CSS Utilities

### Glass Morphism
```jsx
<div className="glass" style={{ padding: '20px' }}>
  Premium frosted glass effect
</div>
```

### Gradient Text
```jsx
<h1 className="gradient-text">Striking Gradient Heading</h1>
```

### Hover Effects
```jsx
<div className="hover-lift">Lifts on hover with shadow</div>
<div className="hover-glow">Glows with teal highlight</div>
```

### Status Indicators
```jsx
<span className="status-indicator status-online"></span>
<span className="status-indicator status-offline"></span>
<span className="status-indicator status-away"></span>
```

### Skeleton Loaders
```jsx
<div className="skeleton" style={{ height: '16px', width: '200px' }}></div>
```

---

## 🎨 Animation Classes

- `.animate-in` - Staggered slide-up entrance
- `.animate-scale` - Scale-in effect
- `.animate-float` - Floating motion
- `.animate-glow` - Pulsing glow effect
- `.animate-slide-left` - Slide from left
- `.animate-slide-right` - Slide from right

---

## 📊 Advanced Features

### Premium Shadows
```css
.shadow-sm /* Subtle */ 
.shadow-md /* Medium */ 
.shadow-lg /* Large */ 
.shadow-xl /* Extra Large */ 
```

### Color System
All components respect the refined color palette:
- Primary Accent: `#0FB981` (Clinical Teal)
- Secondary: `#2563EB` (Professional Blue)
- Success: `#059669`
- Warning: `#D97706`
- Danger: `#DC2626`

### Responsive Design
- Mobile-first approach
- Grid adapts from 4 columns → 2 columns on tablets
- Optimized touch targets (min 44px)
- Flexible typography scaling

---

## 🚀 Integration Guide

### Adding Toast Notifications to AppContext

```jsx
// In AppContext.jsx
const [toasts, setToasts] = useState([]);

const showToast = (type, title, message) => {
  const id = Math.random();
  setToasts(t => [...t, { id, type, title, message }]);
};

const removeToast = (id) => {
  setToasts(t => t.filter(toast => toast.id !== id));
};

// Export in context
<ToastContainer toasts={toasts} removeToast={removeToast} />
```

### Using Enhanced Forms

```jsx
// Replace basic form inputs with InputField
<InputField
  label="Patient Name"
  placeholder="First and last name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  error={nameError}
/>
```

---

## 🎯 Best Practices

### Performance
- Use `LoadingState` for long operations
- Implement `Toast` for user feedback
- Use `EmptyState` to guide empty scenarios
- Lazy-load components for better performance

### Accessibility
- All buttons have proper `aria-labels`
- Form fields have associated labels
- Keyboard navigation supported
- Color contrast meets WCAG AA standards

### UX
- Use appropriate toast types (success/error/warning)
- Provide helpful error messages
- Show loading states for better feedback
- Use animations sparingly but meaningfully

---

## 🔮 Future Enhancements

Potential additions:
- Pagination component
- Advanced table with sorting/filtering
- Date picker calendar
- File upload dropzone
- Charts and graphs library integration
- Breadcrumb navigation
- Stepper/wizard component
- Multi-select dropdown

---

## 📝 Component Architecture

All components follow these principles:
- **Functional components** with hooks
- **Props-based configuration** for flexibility
- **CSS-in-JS** for scoped styling
- **Accessibility-first** design
- **Performance-optimized** with minimal re-renders

---

## 🎨 Design System

SaveCare uses:
- **Typography**: Poppins (display) + Plus Jakarta Sans (body) + JetBrains Mono (code)
- **Radius System**: 6px | 10px | 14px | 20px
- **Spacing**: 4px increments (4px, 8px, 12px, 16px, 20px, 24px, 28px...)
- **Duration**: 0.2s - 0.4s for interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth motion

---

**SaveCare Premium UI Component Library v1.0**
