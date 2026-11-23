import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, startWith } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { LibraryDocsComponent, LibraryProjectPage } from './library-docs.component';

interface Sin { number: number; name: string; letter: string; title: string; description: string; origin: string; slug: string; }
interface Category { numeral: string; slug: string; title: string; subtitle: string; range: string; emblem: string; sins: Sin[]; }
interface ArchiveEntry { kind: 'era' | 'sin' | 'project'; name: string; subtitle: string; path: string; href: string[]; searchable: string; accent: string; }
interface ProjectStep { title: string; text: string; }
interface ProjectCommand { label: string; code: string; }
interface ProjectHighlight { title: string; text: string; }
interface PortfolioProject extends LibraryProjectPage {
  overviewHeading?: string; videoUrl?: string; steps?: ProjectStep[]; highlights?: ProjectHighlight[];
  kind?: 'project' | 'library';
  installation?: { intro: string; commands: ProjectCommand[]; note?: string };
  usage?: { heading: string; intro: string; commandLabel: string; command: string; after: string };
  templates?: string[];
  uninstall?: { intro: string; command: string };
}

@Component({
  selector: 'app-root', standalone: true, imports: [RouterLink, LibraryDocsComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private categoriesSignal = toSignal(this.http.get<Category[]>('http://localhost:3000/api/categories').pipe(catchError(() => of([]))), { initialValue: [] as Category[] });
  private url = toSignal(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), map((event) => event.urlAfterRedirects), startWith(this.router.url)), { initialValue: this.router.url });
  categories = this.categoriesSignal;
  menuOpen = signal(false);
  expandedEra = signal('');
  expandedSin = signal('');
  searchQuery = signal('');
  sortOrder = signal<'asc' | 'desc'>('asc');
  private slug = computed(() => this.url().split('?')[0].split('/').filter(Boolean).at(-1) ?? '');
  category = computed(() => this.categories().find((item) => item.slug === this.slug()));
  sin = computed(() => this.categories().flatMap((item) => item.sins).find((item) => item.slug === this.slug()));
  view = computed(() => {
    const path = this.url().split('?')[0];
    if (path.startsWith('/category/')) return 'category';
    if (path.startsWith('/sin/')) return 'sin';
    if (path === '/projects') return 'projects';
    if (path.startsWith('/project/')) return 'project';
    if (['/about', '/socials', '/skills'].includes(path)) return path.slice(1);
    return 'home';
  });
  projects: PortfolioProject[] = [{
    name: 'BuildSystem',
    slug: 'build-system',
    sinSlug: 'alpha',
    subtitle: 'A command line boilerplate generator for starting clean, organized projects.',
    description: 'BuildSystem creates ready-to-use project structures from language templates, so repetitive setup gives way to the work itself. The repository includes templates for C, C++, Rust, Go, Python, web projects, and x86 assembly.',
    stack: ['Rust', 'Shell', 'Make'],
    repository: 'https://github.com/IhitplayzYT/BuildSystem',
    overviewHeading: 'A clean beginning for every new build.',
    videoUrl: '/assets/media/buildsystem-overview.mp4',
    steps: [
      { title: 'Name the project', text: 'Run buildsys with the directory name you want to create.' },
      { title: 'Choose a template', text: 'Select a language or starter from the interactive list presented in your terminal.' },
      { title: 'Start building', text: 'Enter the new directory. BuildSystem copies the template and replaces PROJ_NAME placeholders with your project name.' }
    ],
    installation: {
      intro: 'Clone the repository, enter its directory, then install the command and templates. The Makefile installs the buildsys command under /usr/bin and copies templates to ~/buildsystemplates. Installation uses sudo to write to the system command directory.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/BuildSystem.git\ncd BuildSystem' },
        { label: '02  /  INSTALL THE COMMAND AND TEMPLATES', code: 'sudo make install' },
        { label: '03  /  REFRESH YOUR SHELL', code: 'source "$HOME/.bashrc"' }
      ],
      note: 'If your current terminal does not recognize buildsys, start a new terminal session or source your shell configuration as shown above.'
    },
    usage: {
      heading: 'Make a new project.',
      intro: 'From the directory where you want your new workspace, run the command with a project name. Select the desired template when prompted, then move into the generated directory.',
      commandLabel: 'CREATE AND ENTER A PROJECT',
      command: 'buildsys my-project\ncd my-project',
      after: 'BuildSystem creates the project folder, copies the selected template into it, and renames any template paths and file contents that use the PROJ_NAME placeholder.'
    },
    templates: ['C', 'C++', 'Rust', 'Go', 'Python', 'Web', 'Assembly (16-bit)', 'Assembly (32-bit)', 'Assembly (64-bit)'],
    uninstall: { intro: 'The Makefile removes the installed command and the user template directory.', command: 'sudo make uninstall' }
  }, {
    name: 'Embedder',
    slug: 'embedder',
    sinSlug: 'alpha',
    subtitle: 'A lightweight C utility for turning binary input into source-ready C arrays or Assembly data.',
    description: 'Embedder reads bytes from standard input and writes a hexadecimal representation to standard output. It is designed for low-level projects that need to carry resources such as images, fonts, configuration data, or small binaries directly in source code.',
    stack: ['C', 'Make', 'GCC', 'x86 assembly'],
    repository: 'https://github.com/IhitplayzYT/Embedder',
    overviewHeading: 'Give raw bytes a place in your source.',
    videoUrl: '/assets/media/embedder-demo.mp4',
    steps: [
      { title: 'Pipe in binary data', text: 'Send a file or stream to Embedder through standard input.' },
      { title: 'Choose a representation', text: 'Generate a C byte array by default, or use -a for Assembly db directives.' },
      { title: 'Use the generated data', text: 'Redirect the formatted output into a header or Assembly source and reference it from your project.' }
    ],
    highlights: [
      { title: 'Two output formats', text: 'Emit a C unsigned char array or an Assembly label with db byte directives.' },
      { title: 'Readable formatting', text: 'Wrap generated data after every 16 input bytes to keep long resources manageable.' },
      { title: 'Plain hexadecimal', text: 'Represent each byte as a hexadecimal escape sequence in C or a 0x-prefixed value in Assembly.' }
    ],
    installation: {
      intro: 'Build Embedder with GCC, Make, and the standard C library. Run make from the repository directory to compile the utility and create the Embedder executable.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/Embedder.git\ncd Embedder' },
        { label: '02  /  BUILD THE UTILITY', code: 'make' },
        { label: '03  /  CLEAN BUILD ARTIFACTS', code: 'make clean' }
      ],
      note: 'The default Makefile target clears the terminal, removes old object and executable files, then compiles Embedder.c with the configured optimization and warning flags.'
    },
    usage: {
      heading: 'Turn a stream into source.',
      intro: 'The basic form is ./Embedder [OPTIONS] <identifier>. Input is read from standard input, and the generated declaration is written to standard output. C output is the default; pass -a to generate Assembly output. Use -h or --help to print the command usage.',
      commandLabel: 'EXAMPLES  /  C AND ASSEMBLY OUTPUT',
      command: 'echo "Hello World" | ./Embedder greeting\ncat image.png | ./Embedder image_data\ncat /bin/ls | ./Embedder -a ls_binary',
      after: 'C output declares an unsigned char array and wraps adjacent hexadecimal string literals every 16 bytes. Assembly output writes a label followed by comma-separated 0x byte values in db directives, also wrapped every 16 bytes.'
    }
  }, {
    name: 'VGrender',
    slug: 'vgrender',
    sinSlug: 'alpha',
    subtitle: 'An experimental DOS graphics demo built with C and 16-bit x86 assembly.',
    description: 'VGrender loads a Windows BMP through DOS file services, converts its pixels to the 16-color VGA palette, and draws the result with BIOS video services. Alongside the image loader, it includes small helpers for pixels, horizontal and vertical lines, rectangle outlines, and palette entries.',
    stack: ['C', '16-bit x86 Assembly', 'DOS', 'BIOS', 'Make'],
    repository: 'https://github.com/IhitplayzYT/VGrender',
    overviewHeading: 'A bitmap, drawn one BIOS call at a time.',
    videoUrl: '/assets/media/vgrender-demo.mp4',
    steps: [
      { title: 'Build the DOS program', text: 'Use Make with GCC configured for -m16, GNU binutils targeting elf_i386, and NASM to produce gui.com.' },
      { title: 'Launch in an emulator', text: 'Mount the project directory in DOSBox or DOSBox-X and run gui.com in the mounted DOS drive.' },
      { title: 'Decode and draw the bitmap', text: 'The demo opens output.bmp, switches to 640×480 VGA mode 0x12, and draws from position (50, 50).' }
    ],
    highlights: [
      { title: 'BMP decoding', text: 'Reads uncompressed indexed and true-color BMPs, including padded rows and both top-down and bottom-up images.' },
      { title: '16-color VGA output', text: 'Maps decoded colors to the nearest entry in VGA mode 0x12. Images are not scaled, and pixels outside the screen are clipped.' },
      { title: 'C and assembly together', text: 'Makes DOS and BIOS operations visible while C code calls the low-level 16-bit assembly routines.' },
      { title: 'Shape helpers', text: 'Includes pixel plotting, horizontal and vertical lines, rectangle outlines, and palette helpers.' },
      { title: 'Streaming BMP reads', text: 'Reads pixel data through a small buffer rather than loading the entire bitmap into memory.' },
      { title: 'Explicit format limits', text: 'Supports BI_RGB BMPs at 1, 4, 8, 16, 24, and 32 bits per pixel; compressed and bitfield BMPs are not supported.' }
    ],
    installation: {
      intro: 'Build from a Linux-like environment with GNU Make, GCC with -m16 support, GNU binutils with elf_i386 support, and NASM. To run the resulting DOS program, use an emulator with BIOS video support such as DOSBox or DOSBox-X.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/VGrender.git\ncd VGrender' },
        { label: '02  /  BUILD GUI.COM', code: 'make' }
      ],
      note: 'The Makefile compiles the C modules, assembles xgfx.asm, links gui.com, and removes intermediate object files.'
    },
    usage: {
      heading: 'Run the DOS demo.',
      intro: 'Mount the project directory as a DOSBox drive, switch to it, and launch the executable. The current demo looks for output.bmp in the mounted working directory.',
      commandLabel: 'DOSBOX  /  MOUNT AND RUN',
      command: 'mount c /path/to/VGrender\nc:\ngui.com',
      after: 'The filename is currently set in main.c. Replace the included output.bmp to display another image, or edit the parse_bmp call to change the base filename or draw position, then rebuild. The BMP API also exposes parse_bmp, bmp_show, and draw_bmp for use from C.'
    }
  }, {
    name: 'AiuWlz',
    slug: 'aiuwlz',
    sinSlug: 'theta',
    kind: 'library',
    subtitle: 'A Rust workspace for tensors, neural networks, machine learning, data handling, and the utilities around them.',
    description: 'AiuWlz brings a set of focused Rust crates together in one Cargo workspace. The public APIs cover tensor construction and operations, autograd, neural-network layers and optimizers, classical machine-learning models, data loading and preprocessing, metrics, image transforms, serving abstractions, and device and random utilities.',
    stack: ['Rust', 'Tensors', 'Autograd', 'Neural Networks', 'Machine Learning', 'CUDA'],
    repository: 'https://github.com/IhitplayzYT/AiuWlz',
    language: 'Rust',
    dependencyLabel: 'Cargo.toml',
    gettingStartedHeading: 'Choose the crate you need.',
    gettingStartedDescription: 'AiuWlz is a Cargo workspace whose root is an application package. Add the member crates you need, then import their public APIs.',
    dependencySnippet: '[dependencies]\nTensors = { path = "src/crates/Tensors" }\nNeuralNets = { path = "src/crates/NeuralNets" }\nDataloader = { path = "src/crates/Dataloader" }',
    quickstartLabel: 'Tensor quickstart',
    quickstartDescription: 'Build a 2 × 2 tensor, create a same-shaped tensor of ones, then add them elementwise.',
    apiDocPath: '/assets/docs/aiuwlz-api.json',
    quickstartSnippet: 'use Tensors::tensor::Tensor;\n\nlet input = Tensor::<f32>::from_vec(\n    vec![1.0, 2.0, 3.0, 4.0],\n    &[2, 2],\n).expect("valid shape");\nlet bias = Tensor::<f32>::ones(&[2, 2]);\nlet output = input.add(&bias).expect("matching shapes");'
  }, {
    name: 'ArgParse',
    slug: 'argparse',
    sinSlug: 'theta',
    kind: 'library',
    subtitle: 'A flexible Rust command-line parser with a typed builder API and a legacy hook-based interface.',
    description: 'ArgParse lets applications register flags and typed options at runtime, parse real or supplied arguments, retrieve values by type, and generate usage text. Its recommended Parser API owns defaults and parsed values; the original CLI API remains available for existing projects.',
    stack: ['Rust', 'CLI', 'Typed Options', 'Builder Pattern'],
    repository: 'https://github.com/IhitplayzYT/ArgParse',
    language: 'Rust',
    dependencyLabel: 'Cargo.toml',
    gettingStartedHeading: 'Register options as you need them.',
    gettingStartedDescription: 'Add ArgParse as a dependency, build a parser with flags and typed options, parse arguments, then retrieve each value by its type.',
    dependencySnippet: '[dependencies]\nArgParse = { path = "../ArgParse" }',
    quickstartLabel: 'Typed parser example',
    quickstartDescription: 'Register a boolean flag and a numeric option, parse the process arguments, then read the resulting values.',
    apiDocPath: '/assets/docs/argparse-api.json',
    quickstartSnippet: 'use ArgParse::Helper::Parser;\n\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    let mut cli = Parser::new();\n    cli.flag("verbose", ["-v", "--verbose"])?\n        .option("port", ["-p", "--port"], 8080u16)?;\n\n    cli.parse()?;\n    let verbose = cli.get::<bool>("verbose").unwrap_or(&false);\n    let port = cli.get::<u16>("port").expect("registered option");\n    println!("port={port}, verbose={verbose}");\n    Ok(())\n}'
  }, {
    name: 'ArguZ',
    slug: 'arguz',
    sinSlug: 'phi',
    subtitle: 'A local-first Rust coding agent that connects an Ollama model to a controlled set of workspace tools.',
    description: 'ArguZ runs an interactive coding assistant against a locally hosted Ollama model. The agent can inspect and edit files, search a workspace, and invoke development tools through a registry. It keeps conversation memory in structured messages, supports model and token settings, and asks before running shell commands.',
    stack: ['Rust', 'Ollama', 'Local LLM', 'Tool Calling', 'Serde'],
    repository: 'https://github.com/IhitplayzYT/ArguZ',
    overviewHeading: 'A private coding partner, close to the code.',
    steps: [
      { title: 'Choose the model and workspace', text: 'Pass a system prompt, select an Ollama model, and set the root directory the tools should work within.' },
      { title: 'Describe the task', text: 'ArguZ sends the conversation and available tool guide to the local model, which can answer or request a named tool with JSON arguments.' },
      { title: 'Review actions and results', text: 'File and search tools return results to the agent. Shell command execution pauses for an explicit user confirmation.' }
    ],
    highlights: [
      { title: 'Local model connection', text: 'Uses Ollama’s local HTTP endpoint, with configurable model name, temperature, step count, and token limits.' },
      { title: 'Workspace tools', text: 'Registers file, directory, grep, find, Cargo, and command tools behind a shared agent context.' },
      { title: 'Conversation memory', text: 'Stores system, user, assistant, and tool messages in a structured form and accepts a memory JSON file as input.' }
    ],
    installation: {
      intro: 'Install Ollama, start its local service, and pull a model before building the Rust application.',
      commands: [
        { label: '01  /  START OLLAMA', code: 'ollama serve' },
        { label: '02  /  GET A MODEL', code: 'ollama pull llama3.2' },
        { label: '03  /  BUILD ARGUZ', code: 'git clone https://github.com/IhitplayzYT/ArguZ.git\ncd ArguZ\ncargo build --release' }
      ],
      note: 'The executable is produced at target/release/ArguZ. Ollama must be reachable at its configured endpoint when the agent runs.'
    },
    usage: {
      heading: 'Start a focused session.',
      intro: 'Provide the required system prompt, point the agent at a workspace, then adjust the model or step budget as needed.',
      commandLabel: 'RUN FROM THE REPOSITORY',
      command: 'cargo run -- \\\n  --sysprompt="You are a careful Rust coding assistant" \\\n  --root="/path/to/workspace" \\\n  --model=llama3.2 \\\n  --steps=20',
      after: 'The CLI also accepts --url, --temp, --min, --max, --maxout, --memory, and --debug. Use --help to display the built-in option guide.'
    }
  }, {
    name: 'BalET',
    slug: 'balet',
    sinSlug: 'eta',
    kind: 'library',
    subtitle: 'A Go load-balancer package exploring backend selection, health checks, and buffered logging.',
    description: 'BalET is designed to distribute HTTP requests across backend servers using round-robin, least-connections, and weighted-connections strategies. Its source also includes health checks and a synchronized lazy logger. The documentation focuses on identifiers actually exported by the Go package and calls out where current package-private members limit external use.',
    stack: ['Go', 'HTTP', 'Concurrency', 'Load Balancing', 'B-tree'],
    repository: 'https://github.com/IhitplayzYT/BalET',
    language: 'Go',
    dependencyLabel: 'Install the module',
    gettingStartedHeading: 'Explore the exported package API.',
    gettingStartedDescription: 'Import the lib package and use its public constructors and logging methods. BalET’s server and request fields, along with its server-registration and dispatch methods, are package-private in the current source.',
    dependencySnippet: 'go get github.com/IhitplayzYT/BalET',
    quickstartLabel: 'Request logging example',
    quickstartDescription: 'Create the exported LogManager and append a request/response entry with its public lazy logging method.',
    apiDocPath: '/assets/docs/balet-api.json',
    quickstartSnippet: 'package main\n\nimport "github.com/IhitplayzYT/BalET/lib"\n\nfunc main() {\n    logger := lib.NewLogManager("requests.log", 100, 4096)\n    logger.LazyLog("GET /health", "200 OK")\n}'
  }, {
    name: 'AutoRcT',
    slug: 'autorc-t',
    sinSlug: 'delta',
    subtitle: 'A Linux file watcher that runs project commands when configured files change.',
    description: 'AutoRcT reads a project’s .RCTconf file, recursively watches configured directories with inotify, and matches file extensions and event types to optional conditions and clean, build, or run commands. It is designed to take repetitive rebuild steps out of a development loop.',
    stack: ['Rust', 'Linux', 'inotify', 'Cargo', '.RCTconf'],
    repository: 'https://github.com/IhitplayzYT/AutoRcT',
    overviewHeading: 'Let file changes start the next build.',
    steps: [
      { title: 'Describe the mapping', text: 'In .RCTconf, map a file extension to its command directory, optional condition, build/run/clean commands, event codes, and monitored directory.' },
      { title: 'Watch the project', text: 'AutoRcT registers inotify watches recursively, filters events by extension and configured event type, and adds watches for new directories.' },
      { title: 'Run the configured actions', text: 'When a matching change passes its optional condition, AutoRcT runs clean, build, then run commands. Press Ctrl+C to stop the watcher.' }
    ],
    highlights: [
      { title: 'Event-driven watching', text: 'Uses Linux inotify notifications instead of polling and watches nested project directories.' },
      { title: 'Per-project rules', text: 'Configure extension mappings, event selection, ignored paths, command directories, and optional command conditions in .RCTconf.' },
      { title: 'Simple development loop', text: 'The checked-in example runs cargo check when a Rust source file is modified.' }
    ],
    installation: {
      intro: 'AutoRcT requires Linux, Rust, and Cargo. Build the release binary from the repository, then point it at a project directory containing .RCTconf.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/AutoRcT.git\ncd AutoRcT' },
        { label: '02  /  BUILD THE WATCHER', code: 'cargo build --release' },
        { label: '03  /  START WATCHING A PROJECT', code: './target/release/AutoRcT --root=/path/to/project' }
      ],
      note: 'If --root is omitted, AutoRcT uses the current directory. The selected root must contain a .RCTconf file.'
    },
    usage: {
      heading: 'Configure the edit-to-build loop.',
      intro: 'Each @FMAP entry contains seven fields in order: command directory, condition, build, run, clean, event codes, and monitor directory. Empty command fields are skipped.',
      commandLabel: '.RCTCONF  /  WATCH RUST SOURCE FILES',
      command: '// Run cargo check when a Rust source file is modified.\n@FMAP{\n    ".rs" -> [".",,"cargo check",,,"mo","."]\n}',
      after: 'Supported event codes include created, deleted, modified, moved, opened, closed after writing, accessed, and attribute changes. Ignored paths can be listed under @IGNORE. Conditions and configured actions run through the system shell. Long-running commands block later event handling, and rapid saves are not debounced.'
    }
  }, {
    name: 'BeZieR',
    slug: 'bezier',
    sinSlug: 'kappa',
    subtitle: 'An interactive terminal editor for points, lines, and quadratic or cubic Bezier curves.',
    description: 'BeZieR turns a terminal into a small geometric drawing surface. Place and select points with the mouse, group control points into splines, and see the shapes rendered in a Ratatui interface. The curve implementations evaluate points using De Casteljau interpolation.',
    stack: ['Rust', 'Ratatui', 'Crossterm', 'Terminal UI', 'Bezier Curves'],
    repository: 'https://github.com/IhitplayzYT/BeZieR',
    overviewHeading: 'Shape a curve, point by point.',
    steps: [
      { title: 'Place control points', text: 'Choose the add-point tool and click the canvas to place the points that define a shape.' },
      { title: 'Choose a spline group', text: 'Select a point, line, quadratic, or cubic group with keys 1–4. The selected group type determines how many recent points are used.' },
      { title: 'Create and refine', text: 'Press G to create a group, select points to move or remove them, and redraw the canvas as the geometry changes.' }
    ],
    highlights: [
      { title: 'Four spline forms', text: 'Create standalone points, straight lines, quadratic curves, and cubic curves.' },
      { title: 'Interactive controls', text: 'Combine keyboard shortcuts with mouse placement, selection, and deletion in a terminal canvas.' },
      { title: 'Curve evaluation', text: 'Quadratic and cubic curves are evaluated with recursive linear interpolation using De Casteljau’s algorithm.' }
    ],
    installation: {
      intro: 'BeZieR is a Rust 2024 application built with Ratatui and Crossterm. Build and launch it from the repository with Cargo.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/BeZieR.git\ncd BeZieR' },
        { label: '02  /  BUILD AND RUN', code: 'cargo run --release' }
      ],
      note: 'Use a terminal large enough to show the drawing canvas; the README recommends at least 80 × 40 characters.'
    },
    usage: {
      heading: 'A small set of keys, a whole canvas.',
      intro: 'Add points, choose the spline group type, then create a group from the most recently placed points. Use the mouse to select or delete points according to the active tool.',
      commandLabel: 'KEYBOARD CONTROLS',
      command: 'A       Add point tool\nS       Select point tool\nD       Delete point tool\n1–4     Point / line / quadratic / cubic group\nG       Create group from recent points\nR       Remove selected group\nX       Delete selected point\nC       Clear canvas\nQ       Quit',
      after: 'A line uses two points, a quadratic curve uses three, and a cubic curve uses four. The terminal must support mouse events for canvas interaction.'
    }
  }, {
    name: 'BM_25-indexer',
    slug: 'bm-25-indexer',
    sinSlug: 'sigma',
    subtitle: 'A C++20 terminal search tool that ranks files with BM25 and updates results as you type.',
    description: 'BM_25-indexer recursively scans a directory of supported text and source files, preprocesses their contents, and ranks documents against a live query using BM25. Choose stopword and stemming modes to trade preprocessing speed for normalization, then navigate the ranked matches in its terminal interface.',
    stack: ['C++20', 'BM25', 'Snowball', 'Lancaster', 'Terminal UI'],
    repository: 'https://github.com/IhitplayzYT/BM_25-indexer',
    overviewHeading: 'Search a corpus, ranked by relevance.',
    steps: [
      { title: 'Index a directory', text: 'The program walks the selected directory tree and reads files with supported extensions into its search corpus.' },
      { title: 'Prepare the query', text: 'Normalize text and optionally remove stopwords or stem words using Snowball or Lancaster modes.' },
      { title: 'Explore ranked results', text: 'BM25 scoring ranks matching documents. Type to update results, move with the arrow keys, and press Enter to print the selected path.' }
    ],
    highlights: [
      { title: 'BM25 ranking', text: 'Scores results using term frequency, document frequency, and document-length normalization.' },
      { title: 'Preprocessing choices', text: 'Select between stopword filtering, Snowball stemming, Lancaster stemming, or raw text matching.' },
      { title: 'Live terminal search', text: 'Search results refresh as the query changes, with keyboard navigation through ranked files.' }
    ],
    installation: {
      intro: 'Build the C++20 application with Make and a compatible compiler. CMake is also provided as an alternative build path.',
      commands: [
        { label: '01  /  CLONE THE REPOSITORY', code: 'git clone https://github.com/IhitplayzYT/BM_25-indexer.git\ncd BM_25-indexer' },
        { label: '02  /  BUILD LOCALLY', code: 'make' },
        { label: '03  /  OPEN THE HELP', code: './BM25_indexer -h' }
      ],
      note: 'The README also documents make install and make uninstall for system-wide installation.'
    },
    usage: {
      heading: 'Tune search before you type.',
      intro: 'Pass a directory and an optional optimization mode. The default mode combines non-aggressive stopword removal with Snowball stemming.',
      commandLabel: 'SEARCH WITH LANCASTER STEMMING',
      command: './BM25_indexer -O1 /path/to/search',
      after: 'Modes 0–3 combine aggressive or non-aggressive stopword removal with Snowball or Lancaster stemming. Mode s uses Snowball only, f uses stopword removal only, and x skips both. In the TUI, type a query, use ↑/↓ to move, Enter to print the selected path, and Esc to exit.'
    }
  }];
  selectedProject = computed(() => this.projects.find((work) => work.slug === this.slug()));
  archiveEntries = computed<ArchiveEntry[]>(() => {
    const entries: ArchiveEntry[] = [];
    for (const age of this.categories()) {
      entries.push({ kind: 'era', name: age.title, subtitle: age.subtitle, path: `ERA ${age.numeral} · ${age.range}`, href: ['/category', age.slug], searchable: `${age.title} ${age.slug} ${age.subtitle} era age epoch period ${age.range}`, accent: age.slug });
      for (const character of age.sins) {
        entries.push({ kind: 'sin', name: character.name, subtitle: `${character.letter} · ${character.title}`, path: `${age.title}  ›  ${character.name}`, href: ['/sin', character.slug], searchable: `${character.name} ${character.letter} ${character.title} ${character.description} sin sinner character symbol ${age.title} ${age.slug}`, accent: age.slug });
      }
    }
    for (const work of this.projects) {
      const age = this.categories().find((item) => item.sins.some((character) => character.slug === work.sinSlug));
      const character = age?.sins.find((item) => item.slug === work.sinSlug);
      if (!age || !character) continue;
      entries.push({ kind: 'project', name: work.name, subtitle: work.subtitle, path: `${age.title}  ›  ${character.name}  ›  ${work.name}`, href: ['/project', work.slug], searchable: `${work.name} ${work.subtitle} ${work.description} ${work.stack.join(' ')} ${work.templates?.join(' ') ?? ''} project repo repository ${character.name} ${character.title} ${age.title}`, accent: age.slug });
    }
    return entries;
  });
  visibleEntries = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    const entries = this.archiveEntries().filter(entry => !query || this.searchScore(query, entry.searchable) > 0);
    return entries.sort((a, b) => a.name.localeCompare(b.name) * (this.sortOrder() === 'asc' ? 1 : -1));
  });
  activeIndex = computed(() => this.categories().findIndex((item) => item.slug === this.slug()));
  openCategory(slug: string) { this.router.navigate(['/category', slug]); }
  toggleMenu() { this.menuOpen.update(open => !open); }
  categoryForSin(slug: string) { return this.categories().find((age) => age.sins.some((item) => item.slug === slug)); }
  toggleEra(slug: string) { this.expandedEra.update(value => value === slug ? '' : slug); }
  toggleSin(slug: string) { this.expandedSin.update(value => value === slug ? '' : slug); }
  projectsForSin(slug: string) { return this.projects.filter((work) => work.sinSlug === slug); }
  eraForSin(slug: string) { return this.categories().find((age) => age.sins.some((character) => character.slug === slug)); }
  closeMenu() { this.menuOpen.set(false); }
  setSearch(event: Event) { this.searchQuery.set((event.target as HTMLInputElement).value); }
  setSort(event: Event) { this.sortOrder.set((event.target as HTMLSelectElement).value as 'asc' | 'desc'); }
  entriesFor(kind: string) { return this.visibleEntries().filter(entry => entry.kind === kind); }
  searchScore(query: string, text: string): number {
    const target = text.toLocaleLowerCase();
    if (target.includes(query)) return 3;
    const queryWords = query.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const targetWords = target.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    let score = 0;
    for (const word of queryWords) {
      if (targetWords.some(token => token.startsWith(word))) { score++; continue; }
      if (targetWords.some(token => this.editDistance(word, token) <= Math.min(2, Math.floor(word.length / 3)))) score++;
    }
    return score === queryWords.length ? 1 : 0;
  }
  private editDistance(a: string, b: string): number {
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return row[b.length];
  }
}
