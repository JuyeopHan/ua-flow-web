# UA-Flow project page draft

A responsive, dependency-free research page inspired by the [Nerfies](https://nerfies.github.io/) format, for **Flow Matching with Uncertainty Quantification and Guidance**.

- [Paper](https://arxiv.org/abs/2602.10326)
- [Public code](https://github.com/JuyeopHan/UA-Flow)

## Preview

With Node.js 18+ installed, clone the repository and start the local server:

```sh
git clone https://github.com/JuyeopHan/ua-flow-web.git
cd ua-flow-web
npm start
```

Open http://localhost:3000. No dependency installation is required. `npm run dev` starts the same server; use `npm run dev -- --port 8080` to change the port. If you use nvm, `nvm use` selects the version in `.nvmrc`. You can also open `index.html` directly.

## Build

```sh
npm run check
npm run build
```

`dist/` contains a standalone static site suitable for GitHub Pages or other static hosting, including hosting beneath a repository subpath. No deployment has been performed.

## Content and assets

The copy, figures, and quantitative results are based on the local manuscript at `~/ws/Han.ea.TMLR2026` (October 2026 draft). The public arXiv version may differ. The page identifies the paper as a preprint and does not claim TMLR acceptance.

The abstract follows `section/abstract.tex`. The results table follows `tab:cfg_scale` in `section/experiments.tex`. All table values are means and standard deviations over three seeds, using each method's best-FID guidance setting.

The interactive viewer selects **precomputed experimental samples**, not live model inference. Each example retains a fixed initial noise seed. UG scales are `[0, 10, 30, 50]`; maximum UCFG scales are `[0, 1, 2, 5, 10, 20]`.

| Web asset | Manuscript source |
| --- | --- |
| `guinea-pig*.webp` | `figures/front/sample_001_label_338_seed_3783*` |
| `goldfinch*.webp` | `figures/front/sample_003_label_11_seed_1423*` |
| `rocking-chair*.webp` | `figures/front/sample_002_label_765_seed_3783*` |
| `church*.webp` | `figures/front/sample_000_label_497_seed_1423*` |
| `figure1-guidance-sweep.webp` | Figure 1 in `root.pdf`, page 2, including original axes and subcaptions; the main caption is reproduced in HTML without figure numbering |
| `uncertainty-comparison-cifar10.webp` | Figure 3(a): `figures/filtering/cifar10_uncertainty_grid_5_9.pdf` |
| `uncertainty-comparison-imagenet128.webp` | Figure 3(b): `figures/filtering/imagenet128_uncertainty_grid_95_99.pdf` |
| `figure3c-uncertainty-comparison.webp` | Figure 3(c): `figures/filtering/imagenet256_uncertainty_grid_15_19.pdf` |
| `filtering-imagenet256.webp` | `figures/filtering/imagenet_256_metrics_vs_filtering.pdf` |
| `guidance-imagenet256.webp` | `figures/CFG/cfg_metrics_imagenet256.pdf` |

Class names follow the zero-based [PyTorch ImageNet label list](https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt): class 11 is **goldfinch**, class 338 is **guinea pig**, class 497 is **church**, and class 765 is **rocking chair**. Asset names, viewer buttons, and accessible descriptions use these labels.

The sprite viewer selects 256 × 256 generated image tiles and 32 × 32 latent uncertainty tiles with the original two-pixel grid spacing. Uncertainty maps are retained losslessly; brighter values indicate higher uncertainty. Paper plots are rasterized for web display and linked to their full-size versions.

All page HTML, CSS, and JavaScript are original. The footer credits Nerfies as the layout reference; no Nerfies media or source code is included.

The method presentation separates **uncertainty quantification** from **uncertainty-aware guidance**. The quantification figure uses original SVG illustrations (`assets/velocity-network.svg` and `assets/flow-dynamics.svg`) alongside actual experimental sample tiles. Its velocity arrows use exact Bézier subcurves of the mean trajectory so their arrowheads follow the trajectory tangent. The uncertainty envelope is built around that same trajectory and begins with zero width at the fixed initial state, explicitly labeled `Var[x_0] = 0`. Mean states use `\bar{\mathbf{x}}_0`, `\bar{\mathbf{x}}_t`, and `\bar{\mathbf{x}}_1`. As in the manuscript, propagated uncertainty remains `\operatorname{Var}[\mathbf{x}_t]`: it describes the state distribution, rather than variance of its deterministic mean. Each ellipse is oriented by the analytic trajectory tangent, and its normal radius matches the envelope width. The endpoint uses an elliptical cap with the same dimensions and a single continuous fill. The trajectory, envelope, and variance ellipses are schematic, not measured confidence regions.

The guidance subsection explains UG's vector correction (`assets/uncertainty-guidance.svg`) and UCFG's variance-based adaptive scale selection (`assets/adaptive-guidance.svg`), including their mean velocity equations and sequential composition. Guidance uses current velocity uncertainty; sample assessment uses propagated endpoint uncertainty. The diagrams stack vertically on smaller screens. All three baseline uncertainty-map panels from Figure 3 appear together in a row after the guidance subsection, with dataset names and no figure numbers. This row scrolls horizontally on narrow screens. Baseline citations link to the original [AU paper](https://openaccess.thecvf.com/content/WACV2025/html/De_Vita_Diffusion_Model_Guided_Sampling_with_Pixel-Wise_Aleatoric_Uncertainty_Estimation_WACV_2025_paper.html) and [BayesDiff paper](https://arxiv.org/abs/2310.11142). The filtering results also link to [GenUnc (Jazbec et al., 2025)](https://proceedings.mlr.press/v286/jazbec25a.html).

## Math assets

LaTeX expressions and accessible descriptions are maintained in `data/equations.json`. They are rendered as vector paths in `assets/math/` and embedded into the method diagrams. Display equations each occupy one line; long equations scroll within their containers on narrow screens. The page uses these local assets directly and requires no math library, CDN, or additional JavaScript at runtime.

To regenerate math after editing the expressions:

```sh
npm run render:math
npm run build
```

Regeneration requires Python 3, `latex` with `amsmath` and `amssymb`, and `dvisvgm`. These are only asset-generation requirements; normal preview and builds use the checked-in SVGs. The generator also updates inline math sizing, display equations, and mathematical labels in the diagrams.

## Before a public release

Review wording and quantitative results against the intended paper version. Add a profile link for Lukas Lao Beyer if desired. Set an absolute Open Graph image URL once the final hosting URL is known. The page currently contains no video placeholder, analytics, or third-party JavaScript.
