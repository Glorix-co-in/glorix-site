#!/bin/bash

# Function to count lines for a specific extension
count_loc() {
    local ext=$1
    find . -name "*.$ext" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -exec cat {} + | wc -l
}

# Get counts
html_count=$(count_loc "html")
css_count=$(count_loc "css")
js_count=$(count_loc "js")

# Calculate total
total_count=$((html_count + css_count + js_count))

# Print table
echo "------------------------------------"
echo "| Language   | Lines of Code       |"
echo "------------------------------------"
printf "| HTML       | %-19s |\n" "$html_count"
printf "| CSS        | %-19s |\n" "$css_count"
printf "| JavaScript | %-19s |\n" "$js_count"
echo "------------------------------------"
printf "| TOTAL      | %-19s |\n" "$total_count"
echo "------------------------------------"
