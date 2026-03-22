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
