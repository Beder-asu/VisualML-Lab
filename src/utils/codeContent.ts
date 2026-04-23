/**
 * codeContent.ts — Algorithm code snippets for CodePanel
 * 
 * Contains JavaScript and Python implementations of the actual
 * mathematical algorithms (derived from ML From Scratch v1.ipynb).
 * Requirements: 5.1, 5.2
 */

export interface AlgorithmCode {
    javascript: string;
    python: string;
}

export const algorithmCode: Record<string, AlgorithmCode> = {
    linearRegression: {
        javascript: `class LinearRegression {
    constructor(lr = 0.1, nIter = 1000) {
        this.lr = lr;
        this.nIter = nIter;
        this.w = null;
    }

    fit(X, Y) {
        const m = X.length;
        const n = X[0].length;
        
        // Pad X with ones for bias
        const newX = X.map(row => [1, ...row]);
        this.w = new Array(n + 1).fill(0);

        for (let iter = 0; iter < this.nIter; iter++) {
            // Predict: newX @ w
            const pred = newX.map(row => 
                row.reduce((sum, val, j) => sum + val * this.w[j], 0)
            );
            
            // Error: pred - Y
            const error = pred.map((p, i) => p - Y[i]);
            
            // Gradient: (1/m) * newX.T @ error
            const dw = new Array(n + 1).fill(0);
            for (let j = 0; j < n + 1; j++) {
                for (let i = 0; i < m; i++) {
                    dw[j] += newX[i][j] * error[i];
                }
                dw[j] /= m;
            }
            
            // Update weights
            for (let j = 0; j < n + 1; j++) {
                this.w[j] -= this.lr * dw[j];
            }
        }
    }

    predict(X) {
        const newX = X.map(row => [1, ...row]);
        return newX.map(row => 
            row.reduce((sum, val, j) => sum + val * this.w[j], 0)
        );
    }
}`,
        python: `class LinearRegression:

    def __init__(self, lr = 0.1, n_iter = 1000):
        self.lr = lr
        self.n_iter = n_iter

    def fit(self,X,Y):
        m,n = X.shape
        newX = np.hstack([np.ones((m,1)) , X])
        self.w = np.zeros(n+1)

        for _ in range(self.n_iter):
            dw = (1/m)*(newX.T)@(newX @ self.w - Y)  
            self.w -= self.lr * dw

    def predict(self, X):
        newX = np.hstack([np.ones((X.shape[0], 1)), X])
        return newX @ self.w`,
    },

    logisticRegression: {
        javascript: `class LogisticRegression {
    constructor(lr = 0.1, nIter = 1000) {
        this.lr = lr;
        this.nIter = nIter;
        this.w = null;
    }

    sigmoid(x) {
        return x.map(val => 1 / (1 + Math.exp(-val)));
    }

    fit(X, Y) {
        const m = X.length;
        const n = X[0].length;
        
        // Pad X with ones for bias
        const newX = X.map(row => [1, ...row]);
        this.w = new Array(n + 1).fill(0);

        for (let iter = 0; iter < this.nIter; iter++) {
            // Linear combination: newX @ w
            const z = newX.map(row => 
                row.reduce((sum, val, j) => sum + val * this.w[j], 0)
            );
            
            // Sigmoid probabilities
            const yPred = this.sigmoid(z);
            
            // Error: yPred - Y
            const error = yPred.map((p, i) => p - Y[i]);
            
            // Gradient: (1/m) * newX.T @ error
            const dw = new Array(n + 1).fill(0);
            for (let j = 0; j < n + 1; j++) {
                for (let i = 0; i < m; i++) {
                    dw[j] += newX[i][j] * error[i];
                }
                dw[j] /= m;
            }
            
            // Update weights
            for (let j = 0; j < n + 1; j++) {
                this.w[j] -= this.lr * dw[j];
            }
        }
    }

    prop(X) {
        const newX = X.map(row => [1, ...row]);
        const z = newX.map(row => 
            row.reduce((sum, val, j) => sum + val * this.w[j], 0)
        );
        return this.sigmoid(z);
    }

    predict(X) {
        const probs = this.prop(X);
        return probs.map(p => p >= 0.5 ? 1 : 0);
    }
}`,
        python: `class LogisticRegression:
    def __init__(self, lr, n_iter):
        self.lr = lr
        self.n_iter = n_iter

    def sigmoid(self,x):
        return 1/(1 + np.exp(-x) )   

    def fit(self, X,Y):
        m,n = X.shape
        newX = np.hstack([np.ones((m,1)) , X])
        self.w = np.zeros(n+1)

        for _ in range(self.n_iter):
            y = self.sigmoid (newX @ self.w)
            dw = (1/m)*(newX.T)@(y - Y)    
            self.w -=self.lr * dw  

    def prop(self, X):
        newX = np.hstack([np.ones((X.shape[0], 1)), X])
        return self.sigmoid(newX @ self.w)
    
    def predict(self,X):
        return (self.prop(X) >= 0.5)      `,
    },

    svm: {
        javascript: `class SVM {
    constructor(C = 1.0, lr = 0.001, nIter = 1000) {
        this.C = C;
        this.lr = lr;
        this.nIter = nIter;
        this.w = null;
        this.b = 0;
    }

    fit(X, Y) {
        const m = X.length;
        const n = X[0].length;
        
        // Convert 0/1 labels to -1/+1
        const Y_svm = Y.map(y => y === 1 ? 1 : -1);
        this.w = new Array(n).fill(0);
        this.b = 0;

        for (let iter = 0; iter < this.nIter; iter++) {
            // Compute margins and identifiers for margin violators
            const marginPts = [];
            for (let i = 0; i < m; i++) {
                const dotProduct = X[i].reduce((sum, val, j) => sum + val * this.w[j], 0);
                const margin = Y_svm[i] * (dotProduct + this.b);
                if (margin < 1) marginPts.push(i);
            }

            // Gradient: dw = 2*w - C * sum(Y[i]*X[i]) for violators
            const dw = this.w.map(w => 2 * w);
            let db = 0;

            for (const i of marginPts) {
                for (let j = 0; j < n; j++) {
                    dw[j] -= this.C * Y_svm[i] * X[i][j];
                }
                db -= this.C * Y_svm[i];
            }

            // Update parameters
            for (let j = 0; j < n; j++) {
                this.w[j] -= this.lr * dw[j];
            }
            this.b -= this.lr * db;
        }
    }

    decision_function(X) {
        return X.map(row => 
            row.reduce((sum, val, j) => sum + val * this.w[j], 0) + this.b
        );
    }

    prop(X) {
        return this.decision_function(X);
    }

    predict(X) {
        const decisions = this.decision_function(X);
        return decisions.map(d => d >= 0 ? 1 : 0);
    }
}`,
        python: `class SVM:
    def __init__(self, C=1.0, lr=0.001, n_iter=1000):
        self.C = C
        self.lr = lr
        self.n_iter = n_iter
        self.w = None
        self.b = 0

    def fit(self, X,Y):
        m, n = X.shape
        Y = np.where(Y == 1, 1, -1)
        self.w = np.zeros(n)
        for _ in range(self.n_iter):
            margin_pts = Y*(X@self.w + self.b) < 1    # soft margin
            dw = 2*self.w - self.C * np.dot(X[margin_pts].T , Y[margin_pts])
            db = -self.C * np.sum(Y[margin_pts])
            self.w -= self.lr * dw
            self.b -= self.lr * db

    def decision_function(self, X):
        return X @ self.w + self.b  

    def prop(self, X):
        return self.decision_function(X)    

    def predict(self, X):
        return (self.decision_function(X) >= 0).astype(int)          `,
    },
    decisionTree: {
        javascript: `class DecisionTree {
    constructor(maxDepth = 5, criterion = 'gini', minSamplesSplit = 2) {
        this.maxDepth = maxDepth;
        this.criterion = criterion;
        this.minSamplesSplit = minSamplesSplit;
        this.root = null;
    }

    // Calculate Gini impurity for a set of labels
    gini(labels) {
        const counts = {};
        for (const label of labels) {
            counts[label] = (counts[label] || 0) + 1;
        }
        
        let impurity = 1.0;
        const total = labels.length;
        for (const count of Object.values(counts)) {
            const prob = count / total;
            impurity -= prob * prob;
        }
        return impurity;
    }

    // Calculate entropy for a set of labels
    entropy(labels) {
        const counts = {};
        for (const label of labels) {
            counts[label] = (counts[label] || 0) + 1;
        }
        
        let ent = 0.0;
        const total = labels.length;
        for (const count of Object.values(counts)) {
            const prob = count / total;
            if (prob > 0) {
                ent -= prob * Math.log2(prob);
            }
        }
        return ent;
    }

    // Find the best split for a node
    findBestSplit(X, Y) {
        const m = X.length;
        const n = X[0].length;
        let bestGain = -Infinity;
        let bestFeature = null;
        let bestThreshold = null;

        const parentImpurity = this.criterion === 'gini' 
            ? this.gini(Y) 
            : this.entropy(Y);

        // Try each feature
        for (let feature = 0; feature < n; feature++) {
            // Get unique values for this feature
            const values = [...new Set(X.map(row => row[feature]))].sort((a, b) => a - b);
            
            // Try each threshold
            for (let i = 0; i < values.length - 1; i++) {
                const threshold = (values[i] + values[i + 1]) / 2;
                
                // Split data
                const leftY = [];
                const rightY = [];
                for (let j = 0; j < m; j++) {
                    if (X[j][feature] <= threshold) {
                        leftY.push(Y[j]);
                    } else {
                        rightY.push(Y[j]);
                    }
                }
                
                if (leftY.length === 0 || rightY.length === 0) continue;
                
                // Calculate information gain
                const leftImpurity = this.criterion === 'gini' 
                    ? this.gini(leftY) 
                    : this.entropy(leftY);
                const rightImpurity = this.criterion === 'gini' 
                    ? this.gini(rightY) 
                    : this.entropy(rightY);
                
                const gain = parentImpurity 
                    - (leftY.length / m) * leftImpurity 
                    - (rightY.length / m) * rightImpurity;
                
                if (gain > bestGain) {
                    bestGain = gain;
                    bestFeature = feature;
                    bestThreshold = threshold;
                }
            }
        }
        
        return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
    }

    // Build tree recursively
    buildTree(X, Y, depth = 0) {
        const m = X.length;
        const uniqueLabels = [...new Set(Y)];
        
        // Stopping conditions
        if (depth >= this.maxDepth || 
            uniqueLabels.length === 1 || 
            m < this.minSamplesSplit) {
            // Create leaf node with majority class
            const counts = {};
            for (const label of Y) {
                counts[label] = (counts[label] || 0) + 1;
            }
            const prediction = Object.keys(counts).reduce((a, b) => 
                counts[a] > counts[b] ? a : b
            );
            return {
                isLeaf: true,
                prediction: parseInt(prediction),
                samples: m,
                depth: depth
            };
        }
        
        // Find best split
        const { feature, threshold, gain } = this.findBestSplit(X, Y);
        
        if (feature === null) {
            // No valid split found, create leaf
            const counts = {};
            for (const label of Y) {
                counts[label] = (counts[label] || 0) + 1;
            }
            const prediction = Object.keys(counts).reduce((a, b) => 
                counts[a] > counts[b] ? a : b
            );
            return {
                isLeaf: true,
                prediction: parseInt(prediction),
                samples: m,
                depth: depth
            };
        }
        
        // Split data
        const leftX = [], leftY = [];
        const rightX = [], rightY = [];
        for (let i = 0; i < m; i++) {
            if (X[i][feature] <= threshold) {
                leftX.push(X[i]);
                leftY.push(Y[i]);
            } else {
                rightX.push(X[i]);
                rightY.push(Y[i]);
            }
        }
        
        // Create internal node
        return {
            isLeaf: false,
            feature: feature,
            threshold: threshold,
            samples: m,
            depth: depth,
            left: this.buildTree(leftX, leftY, depth + 1),
            right: this.buildTree(rightX, rightY, depth + 1)
        };
    }

    fit(X, Y) {
        this.root = this.buildTree(X, Y);
    }

    predictOne(x, node = this.root) {
        if (node.isLeaf) {
            return node.prediction;
        }
        
        if (x[node.feature] <= node.threshold) {
            return this.predictOne(x, node.left);
        } else {
            return this.predictOne(x, node.right);
        }
    }

    predict(X) {
        return X.map(x => this.predictOne(x));
    }
}`,
        python: `from sklearn.tree import DecisionTreeClassifier
import numpy as np

# Create and train a decision tree
clf = DecisionTreeClassifier(
    max_depth=5,           # Maximum tree depth
    criterion='gini',      # Split criterion: 'gini' or 'entropy'
    min_samples_split=2,   # Min samples to split a node
    random_state=42
)

# Fit the model
clf.fit(X_train, y_train)

# Make predictions
y_pred = clf.predict(X_test)

# Get prediction probabilities
y_proba = clf.predict_proba(X_test)

# Access tree structure
n_nodes = clf.tree_.node_count
max_depth = clf.tree_.max_depth
feature = clf.tree_.feature      # Feature used at each node
threshold = clf.tree_.threshold  # Threshold used at each node
children_left = clf.tree_.children_left
children_right = clf.tree_.children_right

# Example: Build tree step-by-step
class StepwiseDecisionTree:
    def __init__(self, max_depth=5, criterion='gini'):
        self.max_depth = max_depth
        self.criterion = criterion
        self.current_depth = 0
        self.tree = None
    
    def step(self, X, y):
        """Build one level of the tree"""
        if self.current_depth == 0:
            # Initialize with root node
            self.tree = DecisionTreeClassifier(
                max_depth=1,
                criterion=self.criterion
            )
            self.tree.fit(X, y)
            self.current_depth = 1
        elif self.current_depth < self.max_depth:
            # Grow tree by one level
            self.current_depth += 1
            self.tree = DecisionTreeClassifier(
                max_depth=self.current_depth,
                criterion=self.criterion
            )
            self.tree.fit(X, y)
        
        return self.tree
    
    def predict(self, X):
        if self.tree is None:
            raise ValueError("Tree not initialized. Call step() first.")
        return self.tree.predict(X)`,
    },
};

/**
 * Get code for a specific algorithm and language
 */
export function getAlgorithmCode(algorithm: string, language: 'javascript' | 'python'): string {
    const code = algorithmCode[algorithm];
    if (!code) {
        return "// Code not available for algorithm: " + algorithm;
    }
    return code[language];
}
