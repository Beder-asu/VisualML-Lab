export interface ChartCode {
    library: string;
    code: string;
}

export interface ChartDef {
    id: string;
    svgId: string;
    name: string;
    variableStructure: string[];
    analyticalGoal: string;
    whenToUse: string[];
    avoidWhen: string[];
    dataRequirements: string[];
    howItEncodesInformation: string[];
    interpretationNotes: string[];
    howToRead: string[];
    cognitiveLoad: 'Easy' | 'Medium' | 'High';
    extensions: string[];
    variants: string[];
    quickExampleUseCase: string;
    codeSnippets: ChartCode[];
}

export const visualizationCheatSheet: ChartDef[] = [
    {
        id: 'bar-chart',
        svgId: 'bar-chart',
        name: 'Bar Chart',
        variableStructure: ['Univariate: (C)', 'Bivariate: (C, N)', 'Direction: (C -> N)'],
        analyticalGoal: 'Comparison',
        whenToUse: ['Compare values across categories', 'Rank items (top/bottom performers)', 'Show differences clearly'],
        avoidWhen: ['Too many categories (clutter)', 'Continuous data (use histogram instead)'],
        dataRequirements: ['Categorical + Numeric', 'Categories should be distinct', 'Ordering optional (but recommended)'],
        howItEncodesInformation: ['Length (primary)', 'Position (secondary)'],
        interpretationNotes: ['Compare bar lengths', 'Look for largest/smallest gaps', 'Check ordering (sorted vs unsorted)'],
        howToRead: [
            '1. Identify the categories on the X-axis (or Y-axis if horizontal).',
            '2. Look at the variable scale on the opposing axis.',
            '3. Compare the absolute height or length of the bars to see relative magnitude.'
        ],
        cognitiveLoad: 'Easy',
        extensions: ['Color (grouping)', 'Faceting (subplots)', 'Stacked bars'],
        variants: ['Horizontal bar chart', 'Grouped bar chart', 'Stacked bar chart'],
        quickExampleUseCase: 'Compare revenue across product categories',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Barplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.barplot(
    data=df, 
    x='Category',          # Categorical groups
    y='Revenue',           # Quantitative measurement
    hue='Region',          # Sub-group color mapping
    estimator='mean',      # Aggregation function (default is mean)
    errorbar=('ci', 95),   # Show 95% Confidence Interval error bars
    capsize=0.1,           # Add caps to the error bars
    palette='muted',       # Define color theme
    width=0.8              # Adjust bar width/thickness
)
plt.title('Revenue by Category')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Bar Syntax Breakdown ===
import plotly.express as px

fig = px.bar(
    df, 
    x='Category', 
    y='Revenue',
    color='Region',             # Color-code by sub-category
    barmode='group',            # 'group' (side-by-side) or 'stack'
    text_auto='.2s',            # Automatically add labels formatted to 2 sig figs
    hover_data=['Profit'],      # Add extra columns to hover tooltip
    title='Revenue by Category'
)
fig.update_layout(xaxis_tickangle=-45) # Tilt long category text
fig.show()` 
            }
        ]
    },
    {
        id: 'histogram',
        svgId: 'histogram',
        name: 'Histogram',
        variableStructure: ['Univariate: (N)'],
        analyticalGoal: 'Distribution',
        whenToUse: ['Understand data shape (normal, skewed)', 'Detect outliers', 'Analyze spread'],
        avoidWhen: ['Small dataset', 'Exact values matter more than distribution'],
        dataRequirements: ['Numeric data', 'Requires binning'],
        howItEncodesInformation: ['Area / Height (frequency)', 'Position (bins)'],
        interpretationNotes: ['Look for skewness', 'Identify peaks (modes)', 'Check spread and gaps'],
        howToRead: [
            '1. View the X-axis to understand the numeric range or "bins".',
            '2. The Y-axis represents the frequency or count of data points falling in that bin.',
            '3. Observe the overall "shape" (e.g., bell curve, skewed left/right, bimodal).'
        ],
        cognitiveLoad: 'Easy',
        extensions: ['Color (multiple distributions)', 'Overlay KDE'],
        variants: ['Density plot', 'KDE plot'],
        quickExampleUseCase: 'Analyze salary distribution',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Histplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.histplot(
    data=df, 
    x='Salary', 
    bins=30,               # Number of distinct bins (or pass an array of bin edges)
    kde=True,              # Overlay Kernel Density Estimate (smooth curve)
    hue='Department',      # Plot overlapping histograms by category
    multiple='layer',      # Try 'stack', 'dodge' (side-by-side), or 'fill' (100% stack)
    stat='probability',    # Y-axis metric: 'count', 'frequency', 'probability', 'percent', 'density'
    element='bars',        # Try 'step' for a filled polygon edge instead of bars
    alpha=0.6              # Transparency for layered visibility
)
plt.title('Salary Distribution')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Histogram Syntax Breakdown ===
import plotly.express as px

fig = px.histogram(
    df, 
    x='Salary', 
    nbins=30,                   # Target number of bins
    color='Department',         # Color distributions by category
    barmode='overlay',          # Try 'stack' or 'group'
    histnorm='probability',     # Normalize Y axis: 'percent', 'probability', 'density'
    marginal='box',             # Add a mini subplot above ('rug', 'box', 'violin')
    opacity=0.7,
    title='Salary Distribution'
)
fig.show()` 
            }
        ]
    },
    {
        id: 'line-chart',
        svgId: 'line-chart',
        name: 'Line Chart',
        variableStructure: ['Bivariate: (N, N)', 'Direction: (Time -> N)'],
        analyticalGoal: 'Trend',
        whenToUse: ['Track changes over time', 'Identify trends and seasonality'],
        avoidWhen: ['Non-ordered categories', 'Sparse or irregular time points'],
        dataRequirements: ['Numeric + ordered variable (usually time)'],
        howItEncodesInformation: ['Position (primary)', 'Slope (change)'],
        interpretationNotes: ['Look for upward/downward trends', 'Identify spikes/drops', 'Check consistency'],
        howToRead: [
            '1. Observe the temporal movement along the X-axis from left to right.',
            '2. Track the continuous line mapping the Y-axis value.',
            '3. Look for slopes (steep means rapid change) and cyclical patterns.'
        ],
        cognitiveLoad: 'Easy',
        extensions: ['Multiple lines (color)', 'Faceting'],
        variants: ['Area chart', 'Step line'],
        quickExampleUseCase: 'Track monthly user growth',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Lineplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.lineplot(
    data=df, 
    x='Month', 
    y='Users',
    hue='Subscription_Type', # Draw separate colored lines per category
    style='City',            # Use different dash patterns (solid vs dashed)
    markers=True,            # Draw actual data point markers on the line
    dashes=False,            # Disable dashed lines if using style
    estimator='mean',        # How to aggregate multiple recordings at the same time-step
    errorbar=('ci', 95),     # Draws shaded confidence intervals over the mean trend
    linewidth=2.5
)
plt.title('Monthly User Growth')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Line Syntax Breakdown ===
import plotly.express as px

fig = px.line(
    df, 
    x='Month', 
    y='Users', 
    color='Subscription_Type',   # Distinct lines by category
    line_dash='City',            # Solid/dashed mapping mapped to data
    markers=True,                # Add scatter points overlaid on the line
    line_shape='spline',         # Try 'linear', 'spline' (smoothed curve), 'hv' (step-chart)
    render_mode='svg',           # Optimize vector rendering
    title='Monthly User Growth'
)
fig.show()` 
            }
        ]
    },
    {
        id: 'scatter-plot',
        svgId: 'scatter-plot',
        name: 'Scatter Plot',
        variableStructure: ['Bivariate: (N, N)', 'Trivariate+: (N, N, C/N)'],
        analyticalGoal: 'Relationship',
        whenToUse: ['Identify correlation', 'Detect clusters or outliers'],
        avoidWhen: ['Overplotting (too many points)', 'Categorical data'],
        dataRequirements: ['Two numeric variables', 'Large sample preferred'],
        howItEncodesInformation: ['Position (x, y)', 'Optional: color, size'],
        interpretationNotes: ['Look for patterns (linear/nonlinear)', 'Identify clusters', 'Spot outliers'],
        howToRead: [
            '1. Find the intersection of X and Y values for individual points.',
            '2. Look at the general trend of the cloud of points (correlation).',
            '3. Identify isolated points far away from the main cluster (outliers).'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Color (category)', 'Size (magnitude)', 'Faceting'],
        variants: ['Bubble chart', 'Hexbin plot'],
        quickExampleUseCase: 'Check correlation between ad spend and revenue',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Scatterplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.scatterplot(
    data=df, 
    x='Ad_Spend', 
    y='Revenue',
    hue='Campaign_Type',   # Color-code bubbles (Categorical/Numeric)
    size='Impressions',    # Bubble size mapped to quantitative variable
    sizes=(20, 200),       # Restrict the min/max radius of the bubbles
    style='Platform',      # Maps shapes (circles, squares, Xs) to a category
    alpha=0.7,             # Adds transparency to fight overplotting
    palette='viridis'      # Linear/Categorical color mapping dictionary
)
plt.title('Ad Spend vs Revenue')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Scatter Syntax Breakdown ===
import plotly.express as px

fig = px.scatter(
    df, 
    x='Ad_Spend', 
    y='Revenue', 
    color='Campaign_Type',      # Hue mapping
    size='Impressions',         # Convert into a Bubble Chart
    size_max=40,                # Restrict max bubble size 
    symbol='Platform',          # Marker shape
    hover_name='Ad_Name',       # Tooltip Header
    hover_data=['Date'],        # Tooltip extra fields
    trendline='ols',            # Automatically fit an Ordinary Least Squares regression line
    marginal_x='histogram',     # Subplots showing distribution attached to axes!
    marginal_y='box',
    title='Ad Spend vs Revenue'
)
fig.show()` 
            }
        ]
    },
    {
        id: 'box-plot',
        svgId: 'box-plot',
        name: 'Box Plot',
        variableStructure: ['Univariate: (N)', 'Bivariate: (C, N)'],
        analyticalGoal: 'Distribution + Comparison',
        whenToUse: ['Compare distributions across groups', 'Detect outliers quickly'],
        avoidWhen: ['Audience unfamiliar with box plots', 'Need detailed distribution shape'],
        dataRequirements: ['Numeric (optionally grouped by category)'],
        howItEncodesInformation: ['Position (median)', 'Length (IQR)', 'Points (outliers)'],
        interpretationNotes: ['Focus on median', 'Compare spread (IQR)', 'Identify outliers'],
        howToRead: [
            '1. The line inside the box is the median (50th percentile).',
            '2. The box edges represent the 25th (Q1) and 75th (Q3) percentiles (Interquartile Range).',
            '3. Whiskers show the data range, excluding assumed outliers.',
            '4. Individual dots outside whiskers are statistical outliers.'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Grouped box plots', 'Color'],
        variants: ['Violin plot', 'Boxen plot'],
        quickExampleUseCase: 'Compare salaries across departments',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Boxplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.boxplot(
    data=df, 
    x='Department',        # Grouping categories
    y='Salary',            # Variable density inside group
    hue='Gender',          # Split boxes side-by-side by subgroup!
    orient='v',            # 'v' (vertical) or 'h' (horizontal). Remember to swap x/y if 'h'
    fliersize=5,           # Outlier diamond size (0 hides them)
    whis=1.5,              # Whisker mathematical bound scalar (1.5 * IQR = standard)
    notch=True,            # Add confidence interval notches to the median wrapper
    width=0.6,             # Box thickness
    palette='Set2'         # Color theme
)
plt.title('Salary Distribution by Department')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Box Syntax Breakdown ===
import plotly.express as px

fig = px.box(
    df, 
    x='Department', 
    y='Salary', 
    color='Gender',           # Side-by-side group dodging
    points='all',             # Show ALL underlying real data points next to the box ('outliers', 'all', False)
    notched=True,             # Display confidence notches
    hover_data=['Employee'],  # Find exactly who the outlier is upon hover!
    title='Salary Distribution by Department'
)
fig.show()` 
            }
        ]
    },
    {
        id: 'pie-chart',
        svgId: 'pie-chart',
        name: 'Pie Chart',
        variableStructure: ['Univariate: (C)'],
        analyticalGoal: 'Composition',
        whenToUse: ['Show part-to-whole (few categories)', 'Simple proportion comparison'],
        avoidWhen: ['Many categories', 'Precise comparison needed'],
        dataRequirements: ['Categorical proportions (sum = 100%)'],
        howItEncodesInformation: ['Angle', 'Area'],
        interpretationNotes: ['Compare largest vs smallest slices', 'Avoid fine-grained comparisons'],
        howToRead: [
            '1. Represents a total 100% of the dataset.',
            '2. Observe the angle and size of the "slices" as a percentage of the total circle.',
            '3. Read labels or legends to map colors to categories.'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Color only'],
        variants: ['Donut chart'],
        quickExampleUseCase: 'Show market share distribution',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Matplotlib Pie Syntax Breakdown ===
import matplotlib.pyplot as plt

# Matplotlib requires direct lists/arrays rather than a DataFrame mapping
plt.pie(
    df['Market_Share'], 
    labels=df['Company'], 
    autopct='%1.1f%%',       # String formatter for the % percentage text
    explode=(0.1, 0, 0, 0),  # "Pop out" heavily offset the very first slice for emphasis
    shadow=True,             # Add 3D-style dropdown shadow
    startangle=90,           # Rotate starting canvas angle
    colors=['#ff9999','#66b3ff','#99ff99','#ffcc99'],
    wedgeprops={'edgecolor': 'white', 'linewidth': 2} # Creates a Donut effectively if hollowed
)
plt.title('Market Share Distribution')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Pie Syntax Breakdown ===
import plotly.express as px

fig = px.pie(
    df, 
    values='Market_Share', 
    names='Company', 
    hole=0.4,                  # Magic argument to instantly transform into a "Donut Chart"
    hover_data=['Raw_Sales'],  # Append absolute numbers to the tooltip
    labels={'Company':'Corp'}, # Rename axis/legend dictionary
    color_discrete_sequence=px.colors.sequential.RdBu,
    title='Market Share'
)
fig.update_traces(textposition='inside', textinfo='percent+label') # Control what renders on the slices
fig.show()` 
            }
        ]
    },
    {
        id: 'heatmap',
        svgId: 'heatmap',
        name: 'Heatmap',
        variableStructure: ['Bivariate: (C, C) or (N, N)'],
        analyticalGoal: 'Pattern / Relationship',
        whenToUse: ['Visualize matrices', 'Detect patterns in large data'],
        avoidWhen: ['Small datasets', 'Precise values required'],
        dataRequirements: ['Matrix/grid structure'],
        howItEncodesInformation: ['Color intensity'],
        interpretationNotes: ['Look for clusters', 'Identify high/low regions'],
        howToRead: [
            '1. Map X and Y axes to locate specific cells in the grid.',
            '2. Utilize the color scale (legend) to interpret cell values (darker vs lighter).',
            '3. Scan for blocks of similar colors to identify groupings or localized patterns.'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Annotation (numbers)', 'Faceting'],
        variants: ['Correlation heatmap'],
        quickExampleUseCase: 'Visualize correlation between features',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Heatmap Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

# Generates a matrix structure representing 1s and 0s / correlations
corr_matrix = df.corr()

sns.heatmap(
    corr_matrix, 
    annot=True,            # Superimpose numerical text on every single square
    fmt='.2f',             # Number formatting string for annot (2 decimal float)
    cmap='coolwarm',       # The gradient spectrum mapping. Very important!
    center=0,              # Anchor the color spectrum. Essential for diverging data (like correlation -1 to 1)
    vmin=-1, vmax=1,       # Hard-cap the color scaling bounds
    linewidths=0.5,        # Subdivide squares with gridlines to make it readable
    linecolor='white',
    cbar_kws={'shrink': 0.8} # Squeeze the size of the legend bar
)
plt.title('Feature Correlation Heatmap')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Heatmap Syntax Breakdown ===
import plotly.express as px

corr_matrix = df.corr()

fig = px.imshow(
    corr_matrix, 
    text_auto='.2f',                    # Renders numbers recursively onto the grid 
    color_continuous_scale='RdBu_r',    # Continuous color map string
    zmin=-1, zmax=1,                    # Anchor values
    aspect='auto',                      # 'auto' squishes to screen, 'equal' keeps squares perfectly square
    origin='lower'                      # Flip the Y-axis calculation
)
fig.update_layout(title='Feature Correlation Heatmap', xaxis_title="Features", yaxis_title="Features")
fig.show()` 
            }
        ]
    },
    {
        id: 'area-chart',
        svgId: 'area-chart',
        name: 'Area Chart',
        variableStructure: ['Bivariate: (Time, N)'],
        analyticalGoal: 'Trend + Composition',
        whenToUse: ['Show cumulative trends', 'Emphasize magnitude over time'],
        avoidWhen: ['Multiple overlapping series (hard to read)'],
        dataRequirements: ['Time + numeric'],
        howItEncodesInformation: ['Area', 'Position'],
        interpretationNotes: ['Focus on total height', 'Compare stacked contributions'],
        howToRead: [
            '1. Track the filled area over time from left to right.',
            '2. If stacked, the total top bound represents the cumulative sum.',
            '3. The vertical height of a specific color band shows that component\'s discrete value.'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Stacked area', 'Color'],
        variants: ['Streamgraph'],
        quickExampleUseCase: 'Track total traffic by source over time',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Matplotlib Area Stack Syntax Breakdown ===
import matplotlib.pyplot as plt

# Matplotlib handles Area charts as fill layers iteratively
plt.stackplot(
    df['Date'],                  # Shared X axis
    df['Organic'], df['Paid'],   # Array of multiple Y axis sequences
    labels=['Organic', 'Paid'],  # Sequence names
    colors=['#2ca02c', '#1f77b4'],
    alpha=0.8,
    baseline='zero'              # Try 'sym' or 'wiggle' to convert this into a Streamgraph instantly!
)
plt.title('Traffic by Source')
plt.legend(loc='upper left')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Area Syntax Breakdown ===
import plotly.express as px

fig = px.area(
    df, 
    x='Date', 
    y='Views',
    color='Traffic_Source',  # Maps sub-categories directly. Stacked by default.
    line_group='Campaign',   # Ensure lines don't cross illegally over data faults
    pattern_shape_sequence=['', '.', 'x', '+'], # Texture patterns over filling
    title='Traffic by Source'
)
# To UNSTACK an area chart, update layout:
# fig.update_traces(stackgroup=None, fill='tozeroy', mode='lines')
fig.show()` 
            }
        ]
    },
    {
        id: 'violin-plot',
        svgId: 'violin-plot',
        name: 'Violin Plot',
        variableStructure: ['Univariate: (N)', 'Bivariate: (C, N)'],
        analyticalGoal: 'Distribution + Comparison',
        whenToUse: ['Compare multiple data distributions', 'Visualize multi-modal data (peaks)'],
        avoidWhen: ['The audience is completely non-technical', 'Dataset has very few points'],
        dataRequirements: ['Numeric (continuous) data grouped by category'],
        howItEncodesInformation: ['Width (density)', 'Position (value)'],
        interpretationNotes: ['Look at where the shape bulges (high density)', 'Check internal box plot (median/IQR)'],
        howToRead: [
            '1. The wider the violin/bulge at a specific Y-value, the more data points exist there.',
            '2. The tiny black box inside acts identically to a standard Box Plot (median & IQR).',
            '3. Multiple "bulges" indicate multi-modal distributions (distinct separate groups within the data).'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Split violin (for binary hues)', 'Inner quartiles'],
        variants: ['Strip plot overlay', 'Swarm plot'],
        quickExampleUseCase: 'Compare exact distribution shape of student test scores by gender',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Violinplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.violinplot(
    data=df, 
    x='Class', 
    y='Score', 
    hue='Gender',           # Subgroup slicing
    split=True,             # If hue has exactly 2 options, splits the violin symmetrically down the middle!
    inner='quartile',       # Replace internal box plot with dashed quartile lines: 'box', 'quartile', 'point', 'stick'
    scale='area',           # Scale width by count: 'area', 'count', 'width' (makes all violins same maximum width)
    bw=0.2,                 # Bandwidth scalar for the KDE smoothing function
    cut=0                   # Stop violin at actual min/max data range (0) or extend to KDE infinity bounds
)
plt.title('Score Distribution by Class')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Violin Syntax Breakdown ===
import plotly.express as px

fig = px.violin(
    df, 
    x='Class', 
    y='Score', 
    color='Gender', 
    box=True,             # Visually integrate a mini-box plot directly inside the body
    points='all',         # Append actual scatter points immediately adjacent to the violin curve!
    hover_data=['Name'],
    violinmode='group',   # Group side by side or 'overlay'
    title='Score Distribution by Class'
)
fig.show()` 
            }
        ]
    },
    {
        id: 'radar-chart',
        svgId: 'radar-chart',
        name: 'Radar Chart',
        variableStructure: ['Multivariate: (C, N...)'],
        analyticalGoal: 'Comparison + Pattern',
        whenToUse: ['Compare profiles or performance metrics', 'Show multi-dimensional strengths/weaknesses'],
        avoidWhen: ['Comparing more than 3-4 profiles simultaneously', 'Metrics have vastly different uncontrolled scales'],
        dataRequirements: ['3+ quantitative variables', 'Unified or normalized scales across axes'],
        howItEncodesInformation: ['Area (overall score)', 'Distance from center (metric value)'],
        interpretationNotes: ['Look for spiked shapes indicating dominant traits', 'Compare polygon total size for overall strength'],
        howToRead: [
            '1. The center of the web represents 0 (or minimum value).',
            '2. The outer edge represents the maximum possible value.',
            '3. Follow the line to see a specific entity\'s "profile" across multiple completely different metrics.'
        ],
        cognitiveLoad: 'High',
        extensions: ['Filled areas', 'Point markers'],
        variants: ['Spider chart', 'Polar area chart'],
        quickExampleUseCase: 'Compare stats (Speed, Power, Agility, Defense) of different athletes',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Matplotlib Radar Syntax Breakdown ===
import matplotlib.pyplot as plt
import numpy as np

# Requires mathematical construction. Seaborn does not support this purely out-of-the-box.
categories = ['Speed', 'Defense', 'Agility', 'Power', 'Magic']
values = [80, 40, 90, 60, 5]

# Array magic to close the circle algebraically
angles = np.linspace(0, 2*np.pi, len(categories), endpoint=False).tolist()
values += values[:1]
angles += angles[:1]

fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
ax.plot(angles, values, color='red', linewidth=2)      # The line outline
ax.fill(angles, values, color='red', alpha=0.25)       # The filling shading
ax.set_xticks(angles[:-1], categories)                 # Label the axis spoke ends
ax.set_ylim(0, 100)                                    # Absolute maximum scale bound
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Radar Syntax Breakdown ===
import plotly.express as px

# Plotly has native radar support via "line_polar"
fig = px.line_polar(
    df, 
    r='Stat_Value',            # The radial numeric magnitude (Y axis basically)
    theta='Metric_Name',       # The rotational categorical axis mapping (X axis basically)
    color='Character_Class',   # Overlays
    line_close=True,           # Connects the final point back to the very first point!
    markers=True,              # Adds explicit metric vertex dots
    template='plotly_dark',    # Dark themes work beautifully on radar bounds
    title='Character Class Stat Comparison'
)
fig.update_traces(fill='toself', fillcolor='rgba(255, 0, 0, 0.2)') # Add the shade overlay
fig.show()` 
            }
        ]
    },
    {
        id: 'pair-plot',
        svgId: 'pair-plot',
        name: 'Pair Plot',
        variableStructure: ['Multivariate: Grid of (N, N)'],
        analyticalGoal: 'Relationship + Distribution',
        whenToUse: ['Exploring high-dimensional datasets', 'Checking collinearity between multiple features'],
        avoidWhen: ['Dataset has more than 6-8 features (grid becomes illegible)', 'Final executive presentations'],
        dataRequirements: ['Table with multiple numeric columns'],
        howItEncodesInformation: ['Matrix grid', 'Scatter (off-diagonal)', 'Histogram/KDE (diagonal)'],
        interpretationNotes: ['Scan diagonally for univariate distributions', 'Scan off-diagonals for linear/non-linear correlations'],
        howToRead: [
            '1. This is a matrix. Find a row name and column name to see how those two variables interact.',
            '2. The diagonal shows the distribution of a single variable against itself (usually a KDE or Histogram).',
            '3. Non-diagonal grids show scatter plots. Look for tight lines (high correlation).'
        ],
        cognitiveLoad: 'High',
        extensions: ['Hue classification (color clusters)', 'Regression lines on scatters'],
        variants: ['Scatter matrix', 'Correlogram'],
        quickExampleUseCase: 'Initial Exploratory Data Analysis (EDA) on a new dataset to find feature correlations',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Seaborn Pairplot Syntax Breakdown ===
import seaborn as sns
import matplotlib.pyplot as plt

sns.pairplot(
    df, 
    vars=['Height', 'Weight', 'Age', 'Income'], # Subset specific columns (default does all numerical)
    hue='Gender',             # Overlay clusters on ALL subplots simultaneously
    diag_kind='kde',          # Render diagonals as 'kde' (smoothed) or 'hist' (bars)
    kind='scatter',           # Render off-diagonals as 'scatter' or 'reg' (with linear regression lines)
    corner=True,              # ONLY draw the bottom-left triangle of the matrix to save absolute rendering time mapping clones!
    plot_kws={'alpha':0.6, 's':20},  # Inject raw matplotlib scatter keyword args (like circle size 's' and alpha)
    diag_kws={'fill':True}           # Inject raw matplotlib KDE keyword args
)
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Scatter Matrix Syntax Breakdown ===
import plotly.express as px

fig = px.scatter_matrix(
    df, 
    dimensions=['Height', 'Weight', 'Age', 'Income'], # The list of numeric properties to grid
    color='Gender',             # Target analytical cluster mapping
    symbol='City',              # Warning: Applying symbol AND hue over a 4x4 array is heavy!
    opacity=0.7,
    title='Demographic Multivariate Analysis Matrix'
)
fig.update_traces(diagonal_visible=False) # Plotly lacks native beautiful KDE diagonals, you can disable them entirely
fig.show()` 
            }
        ]
    },
    {
        id: 'geospatial-map',
        svgId: 'geospatial-map',
        name: 'Geospatial Map',
        variableStructure: ['Bivariate/Trivariate: (Location, N, C)'],
        analyticalGoal: 'Pattern / Distribution',
        whenToUse: ['Visualizing data across regions/countries', 'Showing spatial clustering'],
        avoidWhen: ['Location data is irrelevant to the analysis', 'Significant missing regional data mapping'],
        dataRequirements: ['Coordinates (Lat/Lon) OR standard location names (ISO codes, States)'],
        howItEncodesInformation: ['Position (X/Y Map)', 'Color (choropleth intensity)', 'Size (bubble)'],
        interpretationNotes: ['Look for regional hotspots', 'Check for geographic clusters', 'Interpret color scales carefully'],
        howToRead: [
            '1. Locate the geographic boundaries you recognize.',
            '2. For Choropleths: Read the color legend to understand what darker/lighter regions mean.',
            '3. For Bubble Maps: Larger circles represent higher magnitude data at that exact point.'
        ],
        cognitiveLoad: 'Medium',
        extensions: ['Interactive zooming', 'Mapbox overlays', 'Animated timelines'],
        variants: ['Choropleth Map', 'Scatter Geo Map', 'Hexbin Map'],
        quickExampleUseCase: 'Visualize global sales volume by country',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === GeoPandas Choropleth Syntax Breakdown ===
import geopandas as gpd
import matplotlib.pyplot as plt

# Matplotlib REQUIRES an external spatial dataframe representation containing polygon boundaries (.shp file)
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))

# Merge your standard DataFrame onto the geographical dataframe
merged = world.merge(df, left_on='iso_a3', right_on='Country_ISO', how='left')

ax = merged.plot(
    column='Total_Sales',     # The target numeric distribution
    cmap='OrRd',              # Heatmap coloring string
    scheme='quantiles',       # Binning logic for colors (Try 'jenks' or 'equal_interval')
    k=5,                      # Quantile chunk size
    legend=True,              # Auto-calculate bounding boxes for the legend map
    missing_kwds={'color': 'lightgrey'} # Fill countries you lacked data for!
)
ax.set_axis_off()             # Remove annoying standard X/Y grids (Lat/Long lines)
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Choropleth Syntax Breakdown ===
import plotly.express as px

# Plotly has native global boundary map dictionaries built-in!
fig = px.choropleth(
    df, 
    locations='iso_alpha',             # Your DataFrame column containing 3-letter ISO codes (e.g., 'USA', 'CAN')
    locationmode='ISO-3',              # Alternatively: 'USA-states' or 'country names'
    color='lifeExp',                   # Numeric value to color on
    hover_name='country',              # What pops up on interactive Tooltip
    projection='natural earth',        # Globe mapping: 'equirectangular', 'mercator', 'orthographic' (3D globe!)
    color_continuous_scale=px.colors.sequential.Plasma,
    title='Global Life Expectancy'
)
# fig.update_geos(fitbounds="locations", visible=False) # Automatically zoom exclusively to data regions
fig.show()` 
            }
        ]
    },
    {
        id: 'animation-graph',
        svgId: 'animation-graph',
        name: 'Animated Graph',
        variableStructure: ['Temporal: Time -> (Variables)'],
        analyticalGoal: 'Trend + Evolution',
        whenToUse: ['Storytelling data evolution', 'Showing distinct states changing over time (Hans Rosling style)'],
        avoidWhen: ['Data changes are static or irrelevant', 'Static PDF/Print reporting'],
        dataRequirements: ['A distinct chronological frame column (e.g., Year, Month)'],
        howItEncodesInformation: ['Movement (Time representation)', 'Play/Pause controls'],
        interpretationNotes: ['Watch the state changes over the timeline', 'Focus on trajectory rather than static points'],
        howToRead: [
            '1. Press Play on the graph controls.',
            '2. Watch how the core visual elements (bars, points, lines) move structurally as the time slider progresses.',
            '3. Track specific "entities" (like a single colored bubble) across the timeline.'
        ],
        cognitiveLoad: 'High',
        extensions: ['Play/Pause/Scrub bar controls', 'Trails (leaving ghost points behind)'],
        variants: ['Bar Chart Race', 'Animated Scatter Cluster'],
        quickExampleUseCase: 'Watch GDP vs Life Expectancy evolution across 100 years by country.',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Matplotlib FuncAnimation Syntax Breakdown ===
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation

fig, ax = plt.subplots()
scatter = ax.scatter([], [])  # Empty initialization

def init():
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    return scatter,

def update(frame):
    # 'frame' acts as your timeline integer traversing 0 through X
    # You must mathematically recalculate or query your subset df specific to this 'frame'
    current_data = df[df['Year'] == frame]
    
    # Update coordinates dynamically
    scatter.set_offsets(np.c_[current_data['X'], current_data['Y']])
    ax.set_title(f'Year: {frame}')
    return scatter,

ani = FuncAnimation(
    fig, 
    update,                    # Your logic wrapper algorithm
    frames=range(1950, 2025),  # Iterative loop execution mapping
    init_func=init,            # Ground truth initial environment configuration
    blit=True,                 # Hardware optimization flag for redrawing elements
    interval=200               # MS delay between mathematical frames!
)
# ani.save('animation.gif', writer='imagemagick')
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Animation Syntax Breakdown ===
import plotly.express as px

# Plotly supports ONE-LINE animations using 'animation_frame'!
fig = px.scatter(
    df, 
    x="gdp_per_capita", 
    y="life_expectancy", 
    animation_frame="year",        # Core trigger: creates Play slider chunked distinctly by this column
    animation_group="country",     # Identifier allowing Plotly to link point A to point B frame-by-frame and tween them
    size="population",             # Bubble graph mechanic
    color="continent", 
    hover_name="country",
    size_max=55,                   # Anchor scale so bubbles don't implode
    range_x=[100, 100000],         # ESSENTIAL: Animations crash layouts if axes auto-scale per frame. Lock them!
    range_y=[25, 90], 
    log_x=True                     # Transform to logarithmic so clusters spread properly
)
# fig.layout.updatemenus[0].buttons[0].args[1]["frame"]["duration"] = 500 # Slow down transition tween delays
fig.show()` 
            }
        ]
    },
    {
        id: 'dashboard',
        svgId: 'dashboard',
        name: 'Mini Dashboard',
        variableStructure: ['System: Multiple combined graphs'],
        analyticalGoal: 'Comprehensive Overview',
        whenToUse: ['Building executive KPI views', 'Comparing different facets of a dataset simultaneously'],
        avoidWhen: ['You only need to answer a single trivial question'],
        dataRequirements: ['A cohesive dataset answering multiple analytical angles'],
        howItEncodesInformation: ['Grid Layout', 'Shared interactivity'],
        interpretationNotes: ['Scan for high-level KPIs first', 'Cross-filter to see how one variable affects multiple charts at once'],
        howToRead: [
            '1. Start visually at the top (usually key single-number metrics).',
            '2. Move through the grid: Left-to-Right, Top-to-Bottom.',
            '3. Note how filtering or hovering on one chart might update the data in another.'
        ],
        cognitiveLoad: 'High',
        extensions: ['Cross-filtering', 'Dynamic parameters', 'Real-time updates'],
        variants: ['Matrix Grid Dashboards', 'Tabbed Dashboards'],
        quickExampleUseCase: 'Executive overview showing total sales, sales by region map, and monthly revenue trends.',
        codeSnippets: [
            { 
                library: 'Matplotlib/Seaborn', 
                code: `# === Matplotlib Grid Dash Syntax Breakdown ===
import matplotlib.pyplot as plt
import seaborn as sns

# Construct a mathematical Grid Matrix Layout
# returns parent 'fig' container, and nested array of 'axs' plot references
fig, axs = plt.subplots(nrows=2, ncols=2, figsize=(12, 10), gridspec_kw={'height_ratios': [1, 2]})

# Inject operations cleanly into particular subplot sectors using ax=axs[row, col]
sns.scatterplot(data=df, x='A', y='B', ax=axs[0, 0])
axs[0, 0].set_title('Top Left Scatter')

sns.histplot(data=df, x='C', ax=axs[0, 1], color='red')
axs[0, 1].set_title('Top Right Context')

# Injecting into the bottom row spanning components requires complex ax tracking
sns.boxplot(data=df, x='D', y='E', hue='F', ax=axs[1, 0])
# ...
plt.suptitle('Master Executive Dashboard Overview')
plt.tight_layout() # Magically prevents overlapping text bounds from smashing each other
plt.show()` 
            },
            { 
                library: 'Plotly', 
                code: `# === Plotly Subplots Syntax Breakdown ===
from plotly.subplots import make_subplots
import plotly.graph_objects as go

# Build the layout grid topology
fig = make_subplots(
    rows=2, cols=2,
    specs=[[{"type": "xy"}, {"type": "polar"}],     # Defines exact graph requirements per cell
           [{"colspan": 2}, None]],                 # Col-Span stretches a graph to fill 2 horizontally!
    subplot_titles=("Scatter KPI", "Radar Overlay", "Bottom Long Grid")
)

# Append Graph Object literal traces explicitly to mapped row/col locators
fig.add_trace(go.Scatter(x=df['A'], y=df['B'], mode="markers"), row=1, col=1)
fig.add_trace(go.Scatterpolar(r=df['R'], theta=df['T']), row=1, col=2)
fig.add_trace(go.Bar(x=df['Date'], y=df['Sales']), row=2, col=1)

fig.update_layout(height=800, width=1200, title_text="Executive Subplots Architecture", showlegend=False)
fig.show()` 
            }
        ]
    }
];
