<script>
  let { children, variant = "default", size = "default", class: className, ...rest } = $props();

  const base = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all active:scale-95";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
    ghost: "hover:bg-slate-100"
  };
  const sizes = {
    default: "h-10 px-6",
    sm: "h-8 px-4 text-xs",
    icon: "h-10 w-10"
  };
</script>

<button class="{base} {variants[variant]} {sizes[size]} {className}" {...rest}>
  {@render children()}
</button>