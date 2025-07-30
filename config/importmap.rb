# Pin npm packages by running ./bin/importmap

pin "application", integrity: true
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers", integrity: true

# React dependencies - using CDN for reliable delivery
pin "react", to: "https://ga.jspm.io/npm:react@18.2.0/index.js"
pin "react-dom", to: "https://ga.jspm.io/npm:react-dom@18.2.0/index.js"
pin "scheduler", to: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js"
pin "react-dom/client", to: "https://ga.jspm.io/npm:react-dom@18.2.0/client.js"

# Local React components and initializer with automatic cache busting
pin "react_components", to: "react_components.js", integrity: true
pin_all_from "app/javascript/components", under: "components", integrity: true
