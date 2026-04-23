export interface ConceptContent {
    title: string;
    markdown: string;
}

// Export the concept data for use in components
export const conceptData: Record<string, ConceptContent> = {
    linearRegression: {
        title: "Linear Regression",
        markdown: `
**Description:** Linear Regression models the relationship between features $X$ and a continuous output $y$ by fitting a line that minimizes the total squared error.

**How it works:**
1. Initialize weight vector $\\mathbf{w}$ to zeros
2. Iteratively update $\\mathbf{w}$ using **Gradient Descent** to minimize **Mean Squared Error (MSE)**

**Mean Squared Error (MSE):**
$\\text{MSE} = \\frac{1}{m}\\|\\tilde{X}\\mathbf{w} - \\mathbf{y}\\|^2$

**Gradient:**
$\\nabla_w = \\frac{1}{m} \\tilde{X}^T (\\tilde{X}\\mathbf{w} - \\mathbf{y})$

**Update Rule:**
$\\mathbf{w} \\leftarrow \\mathbf{w} - \\alpha \\cdot \\nabla_w$

**Prediction:** $\\hat{y} = \\tilde{X} \\mathbf{w}$
`
    },
    logisticRegression: {
        title: "Logistic Regression",
        markdown: `
**Description:** A binary classification model that estimates probabilities. It uses a linear equation wrapped in a **Sigmoid function** to output values in $[0, 1]$.

**How it works:**
1. Initialize weights $\\mathbf{w}$ to zeros
2. Iteratively update $\\mathbf{w}$ using Gradient Descent on **Binary Cross-Entropy Loss**

**Sigmoid Function:**
$\\sigma(z) = \\frac{1}{1 + e^{-z}}$

**Binary Cross-Entropy Loss:**
$\\mathcal{L} = -\\frac{1}{m}\\sum\\left[y_i \\log(\\hat{y}_i) + (1 - y_i)\\log(1 - \\hat{y}_i)\\right]$

**Gradient:**
$\\nabla_w = \\frac{1}{m} \\tilde{X}^T (\\hat{y} - \\mathbf{y})$

**Prediction:** Class 1 if $\\sigma(\\tilde{X}\\mathbf{w}) \\geq 0.5$, else Class 0.
`
    },
    svm: {
        title: "Support Vector Machine (SVM)",
        markdown: `
**Description:** SVM finds the optimal hyperplane separating two classes with the **maximum margin**. It uses a soft-margin formulation ($C$) to allow some misclassifications.

**How it works:**
1. Convert labels to $\\{-1, +1\\}$
2. Identify margin-violating points
3. Update weights $\\mathbf{w}$ and bias $b$ using Gradient Descent

**Decision Function:**
$f(\\mathbf{x}) = \\mathbf{x} \\cdot \\mathbf{w} + b$

**Hinge Loss Objective:**
$\\min_{\\mathbf{w}, b} \\|\\mathbf{w}\\|^2 + C \\sum \\max(0,\\ 1 - y_i f(\\mathbf{x}_i))$

**Gradient Update (for violators $y_i f(\\mathbf{x}_i) < 1$):**
$\\nabla_w = 2\\mathbf{w} - C \\sum y_i \\mathbf{x}_i$
$\\nabla_b = -C \\sum y_i$

**Prediction:** Class 1 if $f(\\mathbf{x}) \\geq 0$, else Class 0.
`
    },
    decisionTree: {
        title: "Decision Tree",
        markdown: `
**Description:** A Decision Tree learns decision rules by recursively partitioning the feature space into rectangular regions based on information gain.

**How it works:**
1. At each node, evaluate every feature + threshold split.
2. Pick the split that maximizes **information gain**.
3. Recursively repeat for left and right children.
4. Stop when pure, max depth reached, or min samples met.

**Impurity Metrics:**
Used to measure node purity (lower is better):
- **Gini:** $\\text{Gini}(S) = 1 - \\sum p_k^2$
- **Entropy:** $\\text{Entropy}(S) = -\\sum p_k \\log_2(p_k)$

**Information Gain:**
The reduction in impurity achieved by a split:
$\\text{Gain} = I(S) - \\frac{|S_L|}{|S|}I(S_L) - \\frac{|S_R|}{|S|}I(S_R)$

**Overfitting & Depth:**
Deeper trees capture complex patterns but can overfit. Controlled via:
- **Max Depth:** Limits tree levels.
- **Min Samples Split:** Minimum samples required to split.

**Prediction:** 
Traverse from root to leaf based on split rules and return the leaf's class prediction.
`
    },
    randomForest: {
        title: "Random Forest",
        markdown: `
**Description:** An **ensemble** of Decision Trees, each trained on a random subset of data and features. Reduces overfitting and improves generalization.

**How it works (Bagging):**
1. **Bootstrap**: sample $m$ rows with replacement
2. **Feature subsampling**: select $\\sqrt{n}$ features
3. Train a Decision Tree on the subset
4. Repeat to build $T$ trees

**Aggregation:**
- **Classification:** Majority vote → $\\hat{y} = \\text{mode}(\\hat{y}_1, \\ldots, \\hat{y}_T)$
- **Regression:** Average → $\\hat{y} = \\frac{1}{T}\\sum\\hat{y}_t$
`
    },
    xgboost: {
        title: "XGBoost (Gradient Boosted Trees)",
        markdown: `
**Description:** A **sequential ensemble** that builds trees one at a time. Each new tree corrects the mistakes (pseudo-residuals) of previous trees.

**How it works:**
1. Initialize scores (logits) to zero
2. For each boosting round:
   - Compute residual = $y_{\\text{true}} - p_k$
   - Train a **Regression Tree** on those residuals
   - Update logits: $\\text{logits} \\mathrel{+}= \\alpha \\cdot \\text{tree\\_prediction}$

**Softmax (Classification):**
$p_k = \\frac{e^{z_k}}{\\sum e^{z_j}}$

**Logit Update:**
$z_k^{(t+1)} = z_k^{(t)} + \\alpha \\cdot h_k^{(t)}(X)$
*(where $\\alpha$ is learning rate, $h_k$ is the tree)*
`
    }
};

export default conceptData;
