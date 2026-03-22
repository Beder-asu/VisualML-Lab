export interface ConceptContent {
    title: string;
    markdown: string;
}

export const conceptData: Record<string, ConceptContent> = {
    linearRegression: {
        title: "Linear Regression",
        markdown: `
**Description:** Linear Regression models the relationship between input features $X$ and a continuous output $y$ by fitting a straight line (or hyperplane in higher dimensions) that minimizes the total squared error.

**How it works:**
1. Prepend a column of ones to $X$ to handle the bias/intercept term ($\\beta_0$)
2. Initialize weight vector $\\mathbf{w}$ to zeros
3. Iteratively update $\\mathbf{w}$ using **Gradient Descent** to minimize the **Mean Squared Error (MSE)** loss

**Loss Function — Mean Squared Error:**

$$\\text{MSE} = \\frac{1}{m} \\sum_{i=1}^{m} (\\hat{y}_i - y_i)^2 = \\frac{1}{m}\\|\\tilde{X}\\mathbf{w} - \\mathbf{y}\\|^2$$

**Gradient (derivative of MSE w.r.t. weights):**

$$\\nabla_w = \\frac{1}{m} \\tilde{X}^T (\\tilde{X}\\mathbf{w} - \\mathbf{y})$$

**Update Rule:**

$$\\mathbf{w} \\leftarrow \\mathbf{w} - \\alpha \\cdot \\nabla_w$$

where $\\alpha$ is the learning rate, $m$ is the number of samples, and $\\tilde{X}$ is $X$ with a prepended ones column.

**Prediction:** $\\hat{y} = \\tilde{X} \\mathbf{w}$
`
    },
    logisticRegression: {
        title: "Logistic Regression",
        markdown: `
**Description:** Logistic Regression is a binary classification model that estimates the probability of an input belonging to class 1. It uses the same linear equation as Linear Regression, but wraps the output through a **Sigmoid function** to squish it into the range $[0, 1]$.

**How it works:**
1. Prepend a column of ones to $X$ for the bias term
2. Initialize weights $\\mathbf{w}$ to zeros
3. Iteratively update $\\mathbf{w}$ using Gradient Descent on the **Binary Cross-Entropy (Log Loss)**

**Sigmoid Function:**

$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

**Predicted Probability:**

$$\\hat{y} = \\sigma(\\tilde{X}\\mathbf{w})$$

**Loss Function — Binary Cross-Entropy:**

$$\\mathcal{L} = -\\frac{1}{m}\\sum_{i=1}^{m}\\left[y_i \\log(\\hat{y}_i) + (1 - y_i)\\log(1 - \\hat{y}_i)\\right]$$

**Gradient:**

$$\\nabla_w = \\frac{1}{m} \\tilde{X}^T (\\hat{y} - \\mathbf{y})$$

**Final Prediction:** Class 1 if $\\hat{y} \\geq 0.5$, else Class 0.
`
    },
    svm: {
        title: "Support Vector Machine (SVM)",
        markdown: `
**Description:** SVM finds the optimal hyperplane that separates two classes with the **maximum margin** — the widest possible gap between the closest data points of each class (called *support vectors*). Uses a soft-margin formulation to allow some misclassifications via penalty parameter $C$.

**How it works:**
1. Convert labels to $\\{-1, +1\\}$
2. Initialize weights $\\mathbf{w}$ to zeros, bias $b$ to 0
3. For each iteration, identify margin-violating points and update $\\mathbf{w}$ and $b$

**Decision Function:**

$$f(\\mathbf{x}) = \\mathbf{x} \\cdot \\mathbf{w} + b$$

**Hinge Loss (Soft-Margin) Objective:**

$$\\min_{\\mathbf{w}, b} \\|\\mathbf{w}\\|^2 + C \\sum_{i=1}^{m} \\max(0,\\ 1 - y_i(\\mathbf{x}_i \\cdot \\mathbf{w} + b))$$

**Gradient Update (for margin-violating points where $y_i(\\mathbf{x}_i \\cdot \\mathbf{w} + b) < 1$):**

$$\\nabla_w = 2\\mathbf{w} - C \\sum_{i \\in \\text{violations}} y_i \\mathbf{x}_i$$
$$\\nabla_b = -C \\sum_{i \\in \\text{violations}} y_i$$

**Prediction:** Class 1 if $f(\\mathbf{x}) \\geq 0$, else Class 0.
`
    },
    decisionTree: {
        title: "Decision Tree",
        markdown: `
**Description:** A Decision Tree recursively partitions the feature space by selecting the best feature and threshold to split on at each node. It continues splitting until a stopping condition is met (max depth, minimum samples, or pure node). Supports both classification and regression.

**How it works:**
1. At each node, evaluate every possible feature + threshold combination
2. Pick the split that maximizes the **gain** (reduction in impurity or variance)
3. Recursively repeat for the left and right children
4. Stop when: node is pure, max depth reached, or too few samples remain

**Classification — Gini Impurity:**

$$\\text{Gini}(S) = 1 - \\sum_{k=1}^{K} p_k^2$$

where $p_k$ is the proportion of class $k$ in set $S$.

**Classification — Information Gain:**

$$\\text{Gain} = \\text{Gini}(S) - \\frac{|S_L|}{|S|}\\text{Gini}(S_L) - \\frac{|S_R|}{|S|}\\text{Gini}(S_R)$$

**Regression — Variance Reduction:**

$$\\text{Gain} = \\text{Var}(S) - \\frac{|S_L|}{|S|}\\text{Var}(S_L) - \\frac{|S_R|}{|S|}\\text{Var}(S_R)$$

**Leaf Value:** Mode (most common class) for classification, Mean for regression.

**Prediction:** Traverse the tree from root to leaf, going left if $x_{\\text{feature}} \\leq \\text{threshold}$, right otherwise.
`
    },
    randomForest: {
        title: "Random Forest",
        markdown: `
**Description:** A Random Forest is an **ensemble** of Decision Trees, each trained on a different random subset of the data and features. By combining many diverse, slightly different trees, Random Forest reduces overfitting and improves generalization compared to a single Decision Tree.

**How it works:**
1. For each of $T$ trees (**Bagging**):
   - **Bootstrap** the rows: sample $m$ indices from $[0, m)$ with replacement → each tree sees ~63.2% unique rows
   - **Feature subsampling**: randomly select $\\sqrt{n}$ features (without replacement) from $n$ total features
   - Train a \`DecisionTree\` on only the selected rows and features
   - Store which features were used (needed for prediction)
2. To predict, pass input through all $T$ trees using each tree's specific feature subset

**Bootstrap Sampling:**

$$\\text{idxs} = \\text{random\\_choice}(m, m, \\text{replace=True})$$

**Feature Subset Size:**

$$n_{\\text{features}} = \\lfloor\\sqrt{n}\\rfloor$$

**Aggregation:**
- **Classification:** Majority vote across all trees → $\\hat{y} = \\text{mode}(\\hat{y}_1, \\hat{y}_2, \\ldots, \\hat{y}_T)$
- **Regression:** Average across all trees → $\\hat{y} = \\frac{1}{T}\\sum_{t=1}^{T}\\hat{y}_t$
`
    },
    xgboost: {
        title: "XGBoost (Gradient Boosted Trees)",
        markdown: `
**Description:** XGBoost is a **sequential ensemble** method that builds trees one at a time, where each new tree corrects the mistakes of all previous trees. Unlike Random Forest (which builds trees independently in parallel), XGBoost fits trees to the **pseudo-residuals** (gradients of the loss function).

**How it works (Classification):**
1. Initialize raw scores (**logits**) to zero for each class
2. For each boosting round:
   - Convert logits to probabilities via **Softmax**
   - For each class $k$: compute residual = $y_{\\text{true}} - p_k$, train a **Regression Tree** on those residuals
   - Update the logits: $\\text{logits}_k \\mathrel{+}= \\alpha \\cdot \\text{tree\\_prediction}$
3. Final prediction: $\\arg\\max$ of accumulated logits

**Softmax Function (with numerical stability):**

$$p_k = \\frac{e^{z_k - \\max(\\mathbf{z})}}{\\sum_{j} e^{z_j - \\max(\\mathbf{z})}}$$

**Pseudo-Residual (Negative Gradient of Cross-Entropy):**

$$r_{ik} = y_{ik}^{\\text{onehot}} - p_{ik}$$

**Logit Update:**

$$z_k^{(t+1)} = z_k^{(t)} + \\alpha \\cdot h_k^{(t)}(X)$$

where $\\alpha$ is the learning rate and $h_k^{(t)}$ is the regression tree fitted at round $t$ for class $k$.

**How it works (Regression):**
1. Initialize predictions to the mean of $y$
2. Each round: compute residual = $y - \\hat{y}$, train a Regression Tree on the residuals
3. Update: $\\hat{y} \\mathrel{+}= \\alpha \\cdot \\text{tree\\_prediction}$

> **Key insight:** Even in classification, the internal trees are always **Regression Trees** because they predict continuous gradient values, not class labels.
`
    }
};
